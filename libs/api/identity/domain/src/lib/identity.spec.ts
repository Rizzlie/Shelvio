import { createHash, randomBytes } from 'node:crypto';
import { sessions, users } from '@shelvio/api/db';
import { useTestDatabase } from '@shelvio/api/db/testing';
import { Forbidden, Unauthenticated } from '@shelvio/api/errors';
import {
  type FakeOidcAccount,
  type FakeOidcProvider,
  startFakeOidcProvider,
} from '@shelvio/api/testing/fake-oidc';
import { eq } from 'drizzle-orm';
import * as client from 'openid-client';
import type { AccountHooks } from './account-hooks';
import type { Clock } from './clock';
import type { GoogleOidc } from './google-oidc';
import { Identity, type IdentityLogger } from './identity';
import type { User } from './user';

const clientId = 'shelvio-test.apps.googleusercontent.com';
const clientSecret = 'shelvio-test-secret';
const redirectUri = 'http://127.0.0.1:4200/api/auth/google/callback';

const account = (name: string, overrides: Partial<FakeOidcAccount> = {}): FakeOidcAccount => ({
  sub: `sub-${name}`,
  email: `${name}@example.test`,
  emailVerified: true,
  name: `${name[0].toUpperCase()}${name.slice(1)} Testowa`,
  picture: `https://example.test/avatars/${name}.png`,
  ...overrides,
});

/** On the allowlist, but Google spells the email with capitals. */
const ala = account('ala', { email: 'Ala@Example.TEST' });
const bea = account('bea');
const cela = account('cela');
const dora = account('dora');
const ewa = account('ewa');
const fela = account('fela');
const outsider = account('outsider');
const unverified = account('unverified', { emailVerified: false });
const invited = account('invited', { email: 'Invited@example.test' });
/** Returning people whose Google profile changes between sign-ins. */
const gosia = account('gosia');
const hela = account('hela');
const ida = account('ida');
const jola = account('jola');
const kasia = account('kasia');

const ALLOWLIST = [
  'ala@example.test',
  'bea@example.test',
  'cela@example.test',
  'dora@example.test',
  'ewa@example.test',
  'fela@example.test',
  'unverified@example.test',
  'gosia@example.test',
  'hela@example.test',
  'ida@example.test',
  'jola@example.test',
  'kasia@example.test',
];

/** Time stands still unless a test moves it. */
class FakeClock implements Clock {
  private current = Date.parse('2026-11-20T12:00:00Z');
  now(): Date {
    return new Date(this.current);
  }
  advance(ms: number): void {
    this.current += ms;
  }
}

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

/** Account hooks that record what Identity told them and invite whom the test says. */
class RecordingHooks implements AccountHooks {
  readonly signedIn: User[] = [];
  readonly invitationChecks: string[] = [];
  constructor(private readonly invitedEmails: readonly string[] = []) {}
  async isInvited(email: string): Promise<boolean> {
    this.invitationChecks.push(email);
    return this.invitedEmails.includes(email);
  }
  async afterSignIn(user: User): Promise<void> {
    this.signedIn.push(user);
  }
  async summariseAccount(): Promise<string[]> {
    return [];
  }
  async deleteAccountData(): Promise<void> {
    // nothing to delete
  }
}

/** Keeps what Identity warns about, as the operator would read it in the logs. */
class RecordingLogger implements IdentityLogger {
  readonly warnings: string[] = [];
  warn(message: string): void {
    this.warnings.push(message);
  }
}

describe('signing in with Google', () => {
  const database = useTestDatabase();
  let provider: FakeOidcProvider;
  let google: GoogleOidc;

  beforeAll(async () => {
    provider = await startFakeOidcProvider({
      clientId,
      clientSecret,
      redirectUri,
      accounts: [
        ala,
        bea,
        cela,
        dora,
        ewa,
        fela,
        outsider,
        unverified,
        invited,
        gosia,
        hela,
        ida,
        jola,
        kasia,
      ],
    });
    google = {
      redirectUri,
      // The fake's issuer is Google's while it serves on loopback, so discovery would refuse it.
      async configuration() {
        const configuration = new client.Configuration(provider.metadata, clientId, clientSecret);
        client.allowInsecureRequests(configuration);
        return configuration;
      },
    };
  });

  afterAll(async () => {
    await provider?.stop();
  });

  function identity(
    options: {
      hooks?: AccountHooks;
      clock?: Clock;
      allowlist?: readonly string[];
      logger?: IdentityLogger;
    } = {},
  ) {
    return new Identity({
      db: database.db,
      google,
      signupAllowlist: options.allowlist ?? ALLOWLIST,
      accountHooks: options.hooks ?? new RecordingHooks(),
      clock: options.clock ?? new FakeClock(),
      logger: options.logger ?? new RecordingLogger(),
    });
  }

  /** What the browser does between the two operations: Google's account picker. */
  async function callbackFor(authorizationUrl: URL, who: FakeOidcAccount) {
    return (await provider.signIn(authorizationUrl, who.sub)).searchParams;
  }

  async function signIn(who: FakeOidcAccount, service = identity(), returnTo?: string) {
    const callback = await callbackFor(await service.beginSignIn({ returnTo }), who);
    return service.completeSignIn(callback);
  }

  const storedUsers = (email: string) =>
    database.db.select().from(users).where(eq(users.email, email));

  describe('beginSignIn', () => {
    it('asks Google for the profile and email with PKCE S256, a state, a nonce and the account picker', async () => {
      const url = await identity().beginSignIn({ returnTo: '/' });

      expect(`${url.origin}${url.pathname}`).toBe(provider.metadata.authorization_endpoint);
      const params = url.searchParams;
      expect({
        client_id: params.get('client_id'),
        redirect_uri: params.get('redirect_uri'),
        response_type: params.get('response_type'),
        scope: params.get('scope'),
        prompt: params.get('prompt'),
        code_challenge_method: params.get('code_challenge_method'),
      }).toEqual({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        prompt: 'select_account',
        code_challenge_method: 'S256',
      });
      expect(params.get('code_challenge')).toMatch(/^[\w-]{43}$/);
      expect(params.get('state')).toBeTruthy();
      expect(params.get('nonce')).toBeTruthy();
    });

    it('starts every attempt with its own state and nonce', async () => {
      const service = identity();
      const [first, second] = await Promise.all([service.beginSignIn({}), service.beginSignIn({})]);

      expect(first.searchParams.get('state')).not.toBe(second.searchParams.get('state'));
      expect(first.searchParams.get('nonce')).not.toBe(second.searchParams.get('nonce'));
    });

    it.each([
      ['/kolekcje/42?polka=3#okladka', '/kolekcje/42?polka=3#okladka'],
      ['/', '/'],
      [undefined, '/'],
      ['', '/'],
      ['//evil.example/phish', '/'],
      ['/\\evil.example/phish', '/'],
      ['https://evil.example/phish', '/'],
      ['kolekcje/42', '/'],
      // Browsers drop tabs and newlines from URLs, which would turn these into `//evil.example`.
      ['/\t/evil.example', '/'],
      ['/\n/evil.example', '/'],
    ])('keeps returnTo %j as %j', async (returnTo, expected) => {
      expect((await signIn(ala, identity(), returnTo)).returnTo).toBe(expected);
    });
  });

  describe('admission', () => {
    it('creates an account for an email on the allowlist, compared case-insensitively', async () => {
      const { user } = await signIn(ala);

      expect(user).toEqual({
        id: expect.any(String),
        email: 'ala@example.test',
        name: ala.name,
        avatarUrl: ala.picture,
      });
      expect(await storedUsers('ala@example.test')).toEqual([
        expect.objectContaining({ id: user.id, googleSub: ala.sub, email: 'ala@example.test' }),
      ]);
    });

    it('refuses an email that is neither on the allowlist nor invited, and stores nothing', async () => {
      const hooks = new RecordingHooks();

      const refusal = signIn(outsider, identity({ hooks }));

      await expect(refusal).rejects.toBeInstanceOf(Forbidden);
      await expect(refusal).rejects.toMatchObject({ code: 'auth.inviteOnly' });
      expect(await storedUsers('outsider@example.test')).toEqual([]);
      expect(hooks.signedIn).toEqual([]);
    });

    it('creates an account for an email the account hooks say is invited', async () => {
      const hooks = new RecordingHooks(['invited@example.test']);

      const { user } = await signIn(invited, identity({ hooks }));

      expect(user.email).toBe('invited@example.test');
      expect(hooks.invitationChecks).toEqual(['invited@example.test']);
      expect(await storedUsers('invited@example.test')).toHaveLength(1);
    });

    it('refuses an email Google has not verified, even on the allowlist, and stores nothing', async () => {
      const refusal = signIn(unverified);

      await expect(refusal).rejects.toBeInstanceOf(Forbidden);
      await expect(refusal).rejects.toMatchObject({ code: 'auth.emailNotVerified' });
      expect(await storedUsers('unverified@example.test')).toEqual([]);
    });

    it('recognises a returning person by their Google account', async () => {
      const first = await signIn(bea);
      const second = await signIn(bea);

      expect(second.user.id).toBe(first.user.id);
      expect(await storedUsers('bea@example.test')).toHaveLength(1);
    });
  });

  describe('returning sign-in', () => {
    it('refreshes name, avatar and the lowercased email from Google on every sign-in', async () => {
      const service = identity();
      const first = await signIn(gosia, service);
      const changes = {
        email: 'Malgorzata@Example.TEST',
        name: 'Małgorzata Nowa',
        picture: 'https://example.test/avatars/malgorzata.png',
      };
      provider.updateAccount(gosia.sub, changes);

      const { user, session } = await signIn(gosia, service);

      const refreshed = {
        id: first.user.id,
        email: 'malgorzata@example.test',
        name: changes.name,
        avatarUrl: changes.picture,
      };
      expect(user).toEqual(refreshed);
      expect(await service.getMe(await service.resolveSession(session.token))).toEqual(refreshed);
    });

    it('signs in someone no longer on the allowlist, without asking about Invitations', async () => {
      const { user } = await signIn(hela);
      const hooks = new RecordingHooks();

      const again = await signIn(hela, identity({ allowlist: [], hooks }));

      expect(again.user.id).toBe(user.id);
      expect(hooks.invitationChecks).toEqual([]);
    });

    it('keeps the old email when another account holds the new one, and warns without tokens', async () => {
      const holder = await signIn(jola);
      const { user } = await signIn(ida);
      const logger = new RecordingLogger();
      provider.updateAccount(ida.sub, { email: 'JOLA@example.test', name: 'Ida Zmieniona' });

      const again = await signIn(ida, identity({ logger }));

      expect(again.user).toEqual({ ...user, name: 'Ida Zmieniona' });
      expect(await storedUsers('jola@example.test')).toEqual([
        expect.objectContaining({ id: holder.user.id }),
      ]);
      expect(logger.warnings).toEqual([expect.stringContaining(user.id)]);
      for (const token of [again.session.token, holder.session.token]) {
        expect(logger.warnings.join(' ')).not.toContain(token);
      }
    });

    it('tells afterSignIn about the refreshed person', async () => {
      await signIn(kasia);
      provider.updateAccount(kasia.sub, { name: 'Katarzyna Testowa' });
      const hooks = new RecordingHooks();

      const { user } = await signIn(kasia, identity({ hooks }));

      expect(hooks.signedIn).toEqual([user]);
      expect(user.name).toBe('Katarzyna Testowa');
    });
  });

  describe('afterSignIn', () => {
    it('is told about every successful sign-in, first and returning', async () => {
      const hooks = new RecordingHooks();
      const service = identity({ hooks });

      const first = await signIn(cela, service);
      const second = await signIn(cela, service);

      expect(hooks.signedIn).toEqual([first.user, second.user]);
    });
  });

  describe('the callback', () => {
    const rejected = async (attempt: Promise<unknown>) => {
      await expect(attempt).rejects.toBeInstanceOf(Unauthenticated);
      await expect(attempt).rejects.toMatchObject({ code: 'auth.unauthenticated' });
    };

    it('is refused with a state no attempt started', async () => {
      const service = identity();
      const callback = await callbackFor(await service.beginSignIn({}), dora);
      callback.set('state', client.randomState());

      await rejected(service.completeSignIn(callback));
    });

    it('is accepted once: a replayed callback is refused', async () => {
      const service = identity();
      const callback = await callbackFor(await service.beginSignIn({}), dora);
      await service.completeSignIn(callback);

      await rejected(service.completeSignIn(callback));
    });

    it('is refused when the code was issued for another PKCE challenge', async () => {
      const service = identity();
      const url = await service.beginSignIn({});
      const other = await service.beginSignIn({});
      // Same state and nonce, so only the PKCE verifier can fail.
      url.searchParams.set('code_challenge', other.searchParams.get('code_challenge') ?? '');

      await rejected(service.completeSignIn(await callbackFor(url, dora)));
    });

    it('is refused when the ID token carries another nonce', async () => {
      const service = identity();
      const url = await service.beginSignIn({});
      url.searchParams.set('nonce', client.randomNonce());

      await rejected(service.completeSignIn(await callbackFor(url, dora)));
    });

    it('is refused when Google reports an error, such as a cancelled sign-in', async () => {
      const service = identity();
      const url = await service.beginSignIn({});
      const callback = new URLSearchParams({
        error: 'access_denied',
        state: url.searchParams.get('state') ?? '',
      });

      await rejected(service.completeSignIn(callback));
    });

    it('is accepted within ten minutes of beginSignIn and refused after', async () => {
      const clock = new FakeClock();
      const service = identity({ clock });
      const inTime = await callbackFor(await service.beginSignIn({}), ewa);
      const late = await callbackFor(await service.beginSignIn({}), ewa);

      clock.advance(10 * MINUTE);
      await expect(service.completeSignIn(inTime)).resolves.toBeDefined();
      clock.advance(1);
      await rejected(service.completeSignIn(late));
    });
  });

  describe('sessions', () => {
    const unauthenticated = async (attempt: Promise<unknown>) => {
      await expect(attempt).rejects.toBeInstanceOf(Unauthenticated);
      await expect(attempt).rejects.toMatchObject({ code: 'auth.unauthenticated' });
    };

    it('signs the person in: the returned token resolves to them, and getMe shows their profile', async () => {
      const service = identity();
      const { user, session } = await signIn(fela, service);

      const actor = await service.resolveSession(session.token);

      expect(actor).toEqual({ userId: user.id });
      expect(await service.getMe(actor)).toEqual({
        id: user.id,
        email: 'fela@example.test',
        name: fela.name,
        avatarUrl: fela.picture,
      });
    });

    it('last 30 days from sign-in', async () => {
      const clock = new FakeClock();
      const service = identity({ clock });
      const signedInAt = clock.now().getTime();
      const { user, session } = await signIn(fela, service);

      expect(session.expiresAt).toEqual(new Date(signedInAt + 30 * DAY));
      clock.advance(30 * DAY - 1);
      expect(await service.resolveSession(session.token)).toEqual({ userId: user.id });
      clock.advance(1);
      await unauthenticated(service.resolveSession(session.token));
    });

    it('refuse a token no sign-in issued', async () => {
      await unauthenticated(identity().resolveSession(randomBytes(32).toString('base64url')));
      await unauthenticated(identity().resolveSession(''));
    });

    it('are many per person, one per sign-in, each with its own token', async () => {
      const service = identity();
      const laptop = await signIn(fela, service);
      const phone = await signIn(fela, service);

      expect(phone.session.token).not.toBe(laptop.session.token);
      expect(await service.resolveSession(laptop.session.token)).toEqual({
        userId: laptop.user.id,
      });
      expect(await service.resolveSession(phone.session.token)).toEqual({
        userId: laptop.user.id,
      });
    });

    it('store a hash of the token, never the token itself', async () => {
      const { user, session } = await signIn(fela);

      const stored = await database.db.select().from(sessions).where(eq(sessions.userId, user.id));

      expect(stored.length).toBeGreaterThan(0);
      for (const row of stored) expect(Object.values(row)).not.toContain(session.token);
      expect(stored.map((row) => row.tokenHash)).toContain(
        createHash('sha256').update(session.token).digest('hex'),
      );
    });
  });
});

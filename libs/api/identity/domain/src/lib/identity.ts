import { type Database, sessions, signInAttempts, users } from '@shelvio/api/db';
import { Forbidden, Unauthenticated } from '@shelvio/api/errors';
import { and, eq, gt, isNull, lt } from 'drizzle-orm';
import * as client from 'openid-client';
import type { AccountHooks } from './account-hooks';
import type { Actor } from './actor';
import type { Clock } from './clock';
import type { GoogleOidc } from './google-oidc';
import { safeReturnTo } from './return-to';
import { hashSessionToken, newSessionToken } from './session-token';
import type { User } from './user';

export interface IdentityDependencies {
  db: Database;
  google: GoogleOidc;
  /** Emails that may sign up without an Invitation; compared lowercased. */
  signupAllowlist: readonly string[];
  accountHooks: AccountHooks;
  clock: Clock;
}

export interface SignedIn {
  user: User;
  /** The validated path in the web app to go back to. */
  returnTo: string;
  /** The new session. Its raw token exists only here: hand it to the person, never store or log it. */
  session: { token: string; expiresAt: Date };
}

/** How long a started sign-in may take to come back from Google. */
const SIGN_IN_ATTEMPT_TTL_MS = 10 * 60_000;

/** How long a session lasts after sign-in. */
const SESSION_TTL_MS = 30 * 24 * 60 * 60_000;

/** Fixed parts of every authorization request (spec "Identity module"). */
const AUTHORIZATION_PARAMS = {
  scope: 'openid email profile',
  // Lets a refused person pick another Google account instead of being signed in silently again.
  prompt: 'select_account',
  code_challenge_method: 'S256',
} as const;

/**
 * How `openid-client` rejects a callback: a failed check (state, nonce, ID token), an error
 * Google redirected back with, or an error answer from the token endpoint (such as a PKCE
 * mismatch or a used code).
 */
const SIGN_IN_PROTOCOL_ERRORS = [
  client.ClientError,
  client.AuthorizationResponseError,
  client.ResponseBodyError,
];

/**
 * Not signed in: a callback that doesn't prove a fresh, genuine Google sign-in, or a session token
 * that is unknown, expired or whose user is gone. Either way, the person signs in (again).
 */
const unauthenticated = () => new Unauthenticated('auth.unauthenticated');

/** An optional profile claim of the ID token, if Google sent it as a string. */
const stringClaim = (claims: client.IDToken, name: 'name' | 'picture'): string | null => {
  const value = claims[name];
  return typeof value === 'string' ? value : null;
};

const toUser = (row: typeof users.$inferSelect): User => ({
  id: row.id,
  // Live users always have an email; only tombstones (never returned here) lack one.
  email: row.email ?? '',
  name: row.name,
  avatarUrl: row.avatarUrl,
});

/**
 * The Identity module's domain operations: signing in with Google behind the admission gate,
 * sessions, and the signed-in person's profile.
 * HTTP-agnostic; the REST adapter lives in `@shelvio/api/identity/feature`.
 */
export class Identity {
  private readonly allowlist: ReadonlySet<string>;

  constructor(private readonly deps: IdentityDependencies) {
    this.allowlist = new Set(deps.signupAllowlist.map((email) => email.toLowerCase()));
  }

  /**
   * Starts a Google sign-in and returns the URL to send the person to. The state, PKCE verifier
   * and nonce stay server-side, keyed by state, until the callback consumes them or they expire.
   */
  async beginSignIn({ returnTo }: { returnTo?: string }): Promise<URL> {
    const { db, google, clock } = this.deps;
    const now = clock.now();
    const attempt = {
      state: client.randomState(),
      nonce: client.randomNonce(),
      pkceCodeVerifier: client.randomPKCECodeVerifier(),
      returnTo: safeReturnTo(returnTo),
      expiresAt: new Date(now.getTime() + SIGN_IN_ATTEMPT_TTL_MS),
    };
    // Attempts nobody finished are worthless once expired; clearing them here keeps the table small.
    await db.delete(signInAttempts).where(lt(signInAttempts.expiresAt, now));
    await db.insert(signInAttempts).values(attempt);
    return client.buildAuthorizationUrl(await google.configuration(), {
      ...AUTHORIZATION_PARAMS,
      redirect_uri: google.redirectUri,
      state: attempt.state,
      nonce: attempt.nonce,
      code_challenge: await client.calculatePKCECodeChallenge(attempt.pkceCodeVerifier),
    });
  }

  /**
   * Finishes a sign-in from the query Google redirected back with. Refuses with
   * `Unauthenticated` when the callback doesn't prove a fresh Google sign-in (unknown, used or
   * expired state; PKCE or nonce mismatch; an error from Google), and with `Forbidden` when
   * Google hasn't verified the email (`auth.emailNotVerified`) or a new person isn't admitted
   * (`auth.inviteOnly`). A refusal stores nothing.
   */
  async completeSignIn(callbackParams: URLSearchParams): Promise<SignedIn> {
    const attempt = await this.consumeAttempt(callbackParams.get('state'));
    const claims = await this.exchangeCode(attempt, callbackParams);
    if (claims.email_verified !== true || typeof claims.email !== 'string') {
      throw new Forbidden('auth.emailNotVerified');
    }
    const user = (await this.findBySub(claims.sub)) ?? (await this.admit(claims, claims.email));
    await this.deps.accountHooks.afterSignIn(user);
    return { user, returnTo: attempt.returnTo, session: await this.createSession(user) };
  }

  /** The person a session token belongs to, or `Unauthenticated` for an unknown or expired one. */
  async resolveSession(token: string): Promise<Actor> {
    const [session] = await this.deps.db
      .select({ userId: sessions.userId })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(
        and(
          eq(sessions.tokenHash, hashSessionToken(token)),
          gt(sessions.expiresAt, this.deps.clock.now()),
          isNull(users.deletedAt),
        ),
      );
    if (!session) throw unauthenticated();
    return { userId: session.userId };
  }

  /** The signed-in person's own profile. */
  async getMe(actor: Actor): Promise<User> {
    const [row] = await this.deps.db
      .select()
      .from(users)
      .where(and(eq(users.id, actor.userId), isNull(users.deletedAt)));
    if (!row) throw unauthenticated();
    return toUser(row);
  }

  private async createSession(user: User): Promise<SignedIn['session']> {
    const now = this.deps.clock.now();
    const token = newSessionToken();
    const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
    await this.deps.db.insert(sessions).values({
      userId: user.id,
      tokenHash: hashSessionToken(token),
      createdAt: now,
      expiresAt,
      lastRefreshedAt: now,
    });
    return { token, expiresAt };
  }

  /** Deletes the attempt as it reads it, so a state is honoured at most once. */
  private async consumeAttempt(state: string | null) {
    if (!state) throw unauthenticated();
    const [attempt] = await this.deps.db
      .delete(signInAttempts)
      .where(eq(signInAttempts.state, state))
      .returning();
    if (!attempt || attempt.expiresAt < this.deps.clock.now()) throw unauthenticated();
    return attempt;
  }

  /** The code exchange with ID token verification: issuer, audience, signature, PKCE, nonce. */
  private async exchangeCode(
    attempt: typeof signInAttempts.$inferSelect,
    callbackParams: URLSearchParams,
  ): Promise<client.IDToken> {
    const { google } = this.deps;
    // Built from the registered redirect URI, not the request: behind a proxy the API sees another
    // host, and Google compares the redirect URI exactly.
    const callbackUrl = new URL(google.redirectUri);
    callbackUrl.search = callbackParams.toString();
    try {
      const tokens = await client.authorizationCodeGrant(
        await google.configuration(),
        callbackUrl,
        {
          pkceCodeVerifier: attempt.pkceCodeVerifier,
          expectedState: attempt.state,
          expectedNonce: attempt.nonce,
          idTokenExpected: true,
        },
      );
      const claims = tokens.claims();
      if (!claims) throw unauthenticated();
      return claims;
    } catch (error) {
      if (SIGN_IN_PROTOCOL_ERRORS.some((type) => error instanceof type)) throw unauthenticated();
      // Anything else, such as Google being unreachable, is the API's failure, not the person's.
      throw error;
    }
  }

  private async findBySub(sub: string): Promise<User | undefined> {
    const [row] = await this.deps.db
      .select()
      .from(users)
      .where(and(eq(users.googleSub, sub), isNull(users.deletedAt)));
    return row && toUser(row);
  }

  /**
   * The admission gate for someone Shelvio doesn't know yet: the allowlist or an Invitation,
   * otherwise `auth.inviteOnly` and no account.
   */
  private async admit(claims: client.IDToken, googleEmail: string): Promise<User> {
    const email = googleEmail.toLowerCase();
    const admitted = this.allowlist.has(email) || (await this.deps.accountHooks.isInvited(email));
    if (!admitted) throw new Forbidden('auth.inviteOnly');
    const [row] = await this.deps.db
      .insert(users)
      .values({
        googleSub: claims.sub,
        email,
        name: stringClaim(claims, 'name'),
        avatarUrl: stringClaim(claims, 'picture'),
      })
      .returning();
    return toUser(row);
  }
}

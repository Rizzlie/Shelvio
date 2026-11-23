import { useTestDatabase } from '@shelvio/api/db/testing';
import {
  type FakeOidcAccount,
  type FakeOidcProvider,
  startFakeOidcProvider,
} from '@shelvio/api/testing/fake-oidc';
import type { GoogleOidc } from '@shelvio/api/identity/domain';
import * as client from 'openid-client';
import { TestApp, startTestApp, testConfig } from '../../testing/test-app';
import { GOOGLE_OIDC } from './identity.wiring';

const APP_ORIGIN = 'https://app.shelvio.test';
const GOOGLE_CLIENT_ID = 'shelvio-http-test.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = 'shelvio-http-test-secret';
const GOOGLE_REDIRECT_URI = 'https://app.shelvio.test/api/auth/google/callback';
const THIRTY_DAYS_S = 30 * 24 * 60 * 60;

const owner: FakeOidcAccount = {
  sub: '100000000000000000001',
  email: 'owner@example.test',
  emailVerified: true,
  name: 'Ola Właścicielka',
  picture: 'https://example.test/avatars/owner.png',
};
const outsider: FakeOidcAccount = {
  sub: '100000000000000000005',
  email: 'outsider@example.test',
  emailVerified: true,
  name: 'Olek Obcy',
  picture: 'https://example.test/avatars/outsider.png',
};
const unverified: FakeOidcAccount = {
  sub: '100000000000000000006',
  email: 'unverified@example.test',
  emailVerified: false,
  name: 'Ula Niepotwierdzona',
  picture: 'https://example.test/avatars/unverified.png',
};

/** One `Set-Cookie` header split into its value and attributes (names lowercased). */
function parseSetCookie(header: string) {
  const [pair, ...attributes] = header.split(';').map((part) => part.trim());
  const separator = pair.indexOf('=');
  return {
    name: pair.slice(0, separator),
    value: pair.slice(separator + 1),
    attributes: Object.fromEntries(
      attributes.map((attribute) => {
        const [key, ...rest] = attribute.split('=');
        return [key.toLowerCase(), rest.length > 0 ? rest.join('=') : true];
      }),
    ) as Record<string, string | true>,
  };
}

describe('signing in over HTTP', () => {
  const database = useTestDatabase();
  let provider: FakeOidcProvider;
  let api: TestApp;

  beforeAll(async () => {
    provider = await startFakeOidcProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      redirectUri: GOOGLE_REDIRECT_URI,
      accounts: [owner, outsider, unverified],
    });
    const fakeGoogle: GoogleOidc = {
      redirectUri: GOOGLE_REDIRECT_URI,
      async configuration() {
        const configuration = new client.Configuration(
          provider.metadata,
          GOOGLE_CLIENT_ID,
          GOOGLE_CLIENT_SECRET,
        );
        client.allowInsecureRequests(configuration);
        return configuration;
      },
    };
    api = await startTestApp(
      testConfig({
        DATABASE_URL: database.url,
        APP_ORIGIN,
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_REDIRECT_URI,
        SIGNUP_ALLOWLIST: owner.email,
      }),
      { providers: [{ provide: GOOGLE_OIDC, useValue: fakeGoogle }] },
    );
  });

  afterAll(async () => {
    await api?.app.close();
    await provider?.stop();
  });

  const startSignIn = (query = '') =>
    fetch(`${api.baseUrl}/api/auth/google${query}`, { redirect: 'manual' });

  /**
   * The browser's round trip: the start route, Google's account picker, then the callback, which
   * the test sends to the in-process API instead of the registered redirect URI's host.
   */
  async function signInAs(who: FakeOidcAccount, returnTo?: string) {
    const query = returnTo === undefined ? '' : `?${new URLSearchParams({ returnTo })}`;
    const authorizationUrl = (await startSignIn(query)).headers.get('location') ?? '';
    const callback = await provider.signIn(authorizationUrl, who.sub);
    return fetch(`${api.baseUrl}${callback.pathname}${callback.search}`, { redirect: 'manual' });
  }

  const sessionCookies = (response: Response) =>
    response.headers
      .getSetCookie()
      .map(parseSetCookie)
      .filter((cookie) => cookie.name === '__Host-session');

  const getMe = (cookie?: string) =>
    fetch(`${api.baseUrl}/api/me`, { headers: cookie ? { cookie } : {} });

  describe('the start route', () => {
    it('redirects to Google', async () => {
      const response = await startSignIn('?returnTo=%2Fkolekcje');

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toMatch(
        new RegExp(`^${provider.metadata.authorization_endpoint}\\?`),
      );
    });
  });

  describe('the callback', () => {
    it('sets the __Host-session cookie and redirects to returnTo in the web app', async () => {
      const response = await signInAs(owner, '/kolekcje/42?polka=3');

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(`${APP_ORIGIN}/kolekcje/42?polka=3`);
      const [cookie, ...others] = sessionCookies(response);
      expect(others).toEqual([]);
      expect(cookie.value).toMatch(/^[\w-]{43}$/);
      expect(cookie.attributes).toEqual({
        'max-age': String(THIRTY_DAYS_S),
        path: '/',
        expires: expect.any(String),
        httponly: true,
        secure: true,
        samesite: 'Lax',
      });
      expect(cookie.attributes).not.toHaveProperty('domain');
    });

    it('redirects to the web app root without a returnTo', async () => {
      const response = await signInAs(owner);

      expect(response.headers.get('location')).toBe(`${APP_ORIGIN}/`);
    });

    it.each([
      [outsider, 'auth.inviteOnly'],
      [unverified, 'auth.emailNotVerified'],
    ])(
      'sends a refused person ($email) to the no-access screen without a session',
      async (who, code) => {
        const response = await signInAs(who, '/kolekcje');

        expect(response.status).toBe(302);
        expect(response.headers.get('location')).toBe(`${APP_ORIGIN}/brak-dostepu?code=${code}`);
        expect(sessionCookies(response)).toEqual([]);
      },
    );

    it('sends a callback that proves no sign-in back to the web app without a session', async () => {
      const response = await fetch(
        `${api.baseUrl}/api/auth/google/callback?code=forged&state=unknown`,
        { redirect: 'manual' },
      );

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(`${APP_ORIGIN}/`);
      expect(sessionCookies(response)).toEqual([]);
    });
  });

  describe('GET /api/me', () => {
    it('returns the signed-in person', async () => {
      const [cookie] = sessionCookies(await signInAs(owner));

      const response = await getMe(`__Host-session=${cookie.value}`);

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        id: expect.any(String),
        email: owner.email,
        name: owner.name,
        avatarUrl: owner.picture,
      });
    });

    it('finds the session cookie among other cookies', async () => {
      const [cookie] = sessionCookies(await signInAs(owner));

      const response = await getMe(`theme=dark; __Host-session=${cookie.value}; other=1`);

      expect(response.status).toBe(200);
    });

    it.each([
      ['no cookie', undefined],
      ['an unknown session token', '__Host-session=not-a-real-session-token'],
      ['an empty session cookie', '__Host-session='],
    ])('answers 401 auth.unauthenticated with %s', async (_, cookie) => {
      const response = await getMe(cookie);

      expect(response.status).toBe(401);
      expect(response.headers.get('content-type')).toMatch(/^application\/problem\+json/);
      expect(await response.json()).toEqual({
        type: 'about:blank',
        title: 'Unauthorized',
        status: 401,
        code: 'auth.unauthenticated',
        params: {},
      });
    });
  });
});

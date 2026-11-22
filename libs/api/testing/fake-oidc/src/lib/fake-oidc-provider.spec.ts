import * as client from 'openid-client';
import { afterEach, describe, expect, it } from 'vitest';
import {
  type FakeOidcAccount,
  type FakeOidcProvider,
  startFakeOidcProvider,
} from './fake-oidc-provider';

const clientId = 'shelvio-test-client';
const clientSecret = 'shelvio-test-secret';
const redirectUri = 'http://127.0.0.1:3000/api/auth/callback';

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
  emailVerified: false,
  name: 'Olek Obcy',
  picture: 'https://example.test/avatars/outsider.png',
};

let provider: FakeOidcProvider | undefined;

afterEach(async () => {
  await provider?.stop();
  provider = undefined;
});

async function start() {
  provider = await startFakeOidcProvider({
    clientId,
    clientSecret,
    redirectUri,
    accounts: [owner, outsider],
  });
  return provider;
}

/** What the API will do: an openid-client configuration pointed at the fake's metadata. */
function relyingParty(
  fake: FakeOidcProvider,
  secret = clientSecret,
  authentication?: client.ClientAuth,
) {
  const config = new client.Configuration(fake.metadata, clientId, secret, authentication);
  client.allowInsecureRequests(config);
  return config;
}

async function beginSignIn(config: client.Configuration, overrides: Record<string, string> = {}) {
  const codeVerifier = client.randomPKCECodeVerifier();
  const state = client.randomState();
  const nonce = client.randomNonce();
  const url = client.buildAuthorizationUrl(config, {
    redirect_uri: redirectUri,
    scope: 'openid email profile',
    code_challenge: await client.calculatePKCECodeChallenge(codeVerifier),
    code_challenge_method: 'S256',
    state,
    nonce,
    prompt: 'select_account',
    ...overrides,
  });
  return { url, codeVerifier, state, nonce };
}

describe('fake OIDC provider', () => {
  it('completes a full authorization code flow with openid-client', async () => {
    const fake = await start();
    const config = relyingParty(fake);
    const attempt = await beginSignIn(config);

    const callback = await fake.signIn(attempt.url, owner.sub);
    const tokens = await exchange(config, callback, attempt);

    expect(callback.origin + callback.pathname).toBe(redirectUri);
    expect(tokens.claims()).toMatchObject({
      iss: 'https://accounts.google.com',
      aud: clientId,
      sub: owner.sub,
      email: 'owner@example.test',
      email_verified: true,
      nonce: attempt.nonce,
      name: 'Ola Właścicielka',
      picture: 'https://example.test/avatars/owner.png',
    });
  });

  it('listens on loopback, serves its metadata at the discovery path and stops cleanly', async () => {
    const fake = await start();

    const discovery = await fetch(`${fake.url}/.well-known/openid-configuration`);

    expect(new URL(fake.url).hostname).toBe('127.0.0.1');
    expect(await discovery.json()).toEqual(fake.metadata);
    expect(fake.metadata.issuer).toBe('https://accounts.google.com');

    await fake.stop();
    provider = undefined;
    await expect(fetch(`${fake.url}/jwks`)).rejects.toThrow();
  });

  it('lists every configured account on the authorization page', async () => {
    const fake = await start();
    const attempt = await beginSignIn(relyingParty(fake));

    const page = await fetch(attempt.url);
    const html = await page.text();

    expect(page.status).toBe(200);
    expect(page.headers.get('content-type')).toMatch(/^text\/html/);
    expect(html).toContain('Ola Właścicielka (owner@example.test)');
    expect(html).toContain('Olek Obcy (outsider@example.test)');
  });

  it('signs in an account whose email is not verified, reporting email_verified=false', async () => {
    const fake = await start();
    const config = relyingParty(fake);
    const attempt = await beginSignIn(config);
    const callback = await fake.signIn(attempt.url, outsider.sub);

    const tokens = await exchange(config, callback, attempt);

    expect(tokens.claims()).toMatchObject({ sub: outsider.sub, email_verified: false });
  });
});

function exchange(
  config: client.Configuration,
  callback: URL,
  attempt: { codeVerifier: string; state: string; nonce: string },
) {
  return client.authorizationCodeGrant(config, callback, {
    pkceCodeVerifier: attempt.codeVerifier,
    expectedState: attempt.state,
    expectedNonce: attempt.nonce,
  });
}

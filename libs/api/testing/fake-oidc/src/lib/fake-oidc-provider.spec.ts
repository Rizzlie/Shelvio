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

async function start(options: { now?: () => number } = {}) {
  provider = await startFakeOidcProvider({
    clientId,
    clientSecret,
    redirectUri,
    accounts: [owner, outsider],
    ...options,
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

  it('accepts client_secret_basic authentication at the token endpoint', async () => {
    const fake = await start();
    const config = relyingParty(fake, undefined, client.ClientSecretBasic(clientSecret));
    const attempt = await beginSignIn(config);
    const callback = await fake.signIn(attempt.url, owner.sub);

    const tokens = await exchange(config, callback, attempt);

    expect(tokens.claims()?.sub).toBe(owner.sub);
  });

  it('rejects the token request when the client secret is wrong', async () => {
    const fake = await start();
    const config = relyingParty(fake, 'not-the-secret');
    const attempt = await beginSignIn(config);
    const callback = await fake.signIn(attempt.url, owner.sub);

    await expect(exchange(config, callback, attempt)).rejects.toMatchObject({
      error: 'invalid_client',
    });
  });

  it('refuses to authorize a redirect URI other than the registered one, without redirecting', async () => {
    const fake = await start();
    const attempt = await beginSignIn(relyingParty(fake), {
      redirect_uri: 'http://127.0.0.1:6666/steal',
    });

    const page = await fetch(attempt.url, { redirect: 'manual' });

    expect(page.status).toBe(400);
    expect(page.headers.get('location')).toBeNull();
    await expect(fake.signIn(attempt.url, owner.sub)).rejects.toThrow(/400/);
  });

  it.each([
    ['state is missing', { state: '' }],
    ['nonce is missing', { nonce: '' }],
    ['the PKCE challenge is missing', { code_challenge: '' }],
    ['the PKCE method is not S256', { code_challenge_method: 'plain' }],
    ['the response type is not code', { response_type: 'token' }],
    ['the client id is unknown', { client_id: 'someone-else' }],
  ])('refuses to authorize when %s', async (_case, overrides) => {
    const fake = await start();
    const attempt = await beginSignIn(relyingParty(fake), overrides);

    const page = await fetch(attempt.url, { redirect: 'manual' });

    expect(page.status).toBe(400);
  });

  it('rejects the token request when its redirect URI differs from the authorized one', async () => {
    const fake = await start();
    const config = relyingParty(fake);
    const attempt = await beginSignIn(config);
    const callback = await fake.signIn(attempt.url, owner.sub);
    callback.pathname = '/api/auth/other-callback';

    await expect(exchange(config, callback, attempt)).rejects.toMatchObject({
      error: 'invalid_grant',
    });
  });

  it('rejects the token request when the PKCE verifier does not match the challenge', async () => {
    const fake = await start();
    const config = relyingParty(fake);
    const attempt = await beginSignIn(config);
    const callback = await fake.signIn(attempt.url, owner.sub);

    await expect(
      exchange(config, callback, { ...attempt, codeVerifier: client.randomPKCECodeVerifier() }),
    ).rejects.toMatchObject({ error: 'invalid_grant' });
  });

  it('accepts a code only once', async () => {
    const fake = await start();
    const config = relyingParty(fake);
    const attempt = await beginSignIn(config);
    const callback = await fake.signIn(attempt.url, owner.sub);
    await exchange(config, callback, attempt);

    await expect(exchange(config, callback, attempt)).rejects.toMatchObject({
      error: 'invalid_grant',
    });
  });

  it('issues ID tokens openid-client accepts even when the injected clock is far from real time', async () => {
    const fake = await start({ now: () => Date.parse('2020-01-01T00:00:00Z') });
    const config = relyingParty(fake);
    const attempt = await beginSignIn(config);
    const callback = await fake.signIn(attempt.url, owner.sub);

    const tokens = await exchange(config, callback, attempt);

    expect(tokens.claims()?.sub).toBe(owner.sub);
  });

  it('rejects a code used after it expired', async () => {
    let clock = Date.parse('2026-11-20T12:00:00Z');
    const fake = await start({ now: () => clock });
    const config = relyingParty(fake);
    const attempt = await beginSignIn(config);
    const callback = await fake.signIn(attempt.url, owner.sub);

    clock += 61_000;

    await expect(exchange(config, callback, attempt)).rejects.toMatchObject({
      error: 'invalid_grant',
    });
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

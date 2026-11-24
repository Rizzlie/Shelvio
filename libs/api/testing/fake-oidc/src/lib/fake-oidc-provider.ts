import {
  createHash,
  generateKeyPairSync,
  randomBytes,
  randomUUID,
  sign,
  type KeyObject,
} from 'node:crypto';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';

/** The issuer the fake claims to be: the API verifies ID tokens exactly as it would Google's. */
const GOOGLE_ISSUER = 'https://accounts.google.com';

/** A synthetic Google account offered on the fake's account-picker page. */
export interface FakeOidcAccount {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture: string;
}

export interface FakeOidcProviderOptions {
  clientId: string;
  clientSecret: string;
  /** The only redirect URI the fake accepts, compared exactly. */
  redirectUri: string;
  accounts: FakeOidcAccount[];
  /**
   * Clock in epoch milliseconds for authorization-code expiry (codes live 60 s). Default `Date.now`.
   * ID token `iat`/`exp` always use real time, because `openid-client` checks them against the
   * real clock: a test's fake clock must not make every token look expired.
   */
  now?: () => number;
}

/** The OIDC discovery document the fake serves; endpoints are on loopback, the issuer is Google's. */
export type FakeOidcMetadata = {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  jwks_uri: string;
  response_types_supported: string[];
  subject_types_supported: string[];
  id_token_signing_alg_values_supported: string[];
  scopes_supported: string[];
  token_endpoint_auth_methods_supported: string[];
  code_challenge_methods_supported: string[];
  claims_supported: string[];
};

export interface FakeOidcProvider {
  /** Base URL on loopback, e.g. `http://127.0.0.1:53124`. */
  readonly url: string;
  /** Discovery metadata, to hand to `openid-client` in place of Google's. */
  readonly metadata: FakeOidcMetadata;
  /**
   * Does what a person does in the browser: opens the authorization URL, picks the account with
   * this `sub` and returns the callback URL the provider redirects to (with `code` and `state`).
   */
  signIn(authorizationUrl: URL | string, sub: string): Promise<URL>;
  /**
   * Changes an account's Google profile, as when the person renames themselves or switches email
   * in Google: later sign-ins carry the new claims under the same `sub`.
   */
  updateAccount(sub: string, changes: Partial<Omit<FakeOidcAccount, 'sub'>>): void;
  /** Stops listening and drops open connections. */
  stop(): Promise<void>;
}

interface PendingCode {
  request: AuthorizationRequest;
  account: FakeOidcAccount;
  expiresAt: number;
}

interface AuthorizationRequest {
  redirectUri: string;
  state: string;
  nonce: string;
  codeChallenge: string;
  scope: string;
}

class OAuthError extends Error {
  constructor(
    readonly status: number,
    readonly error: string,
    readonly description: string,
  ) {
    super(`${error}: ${description}`);
  }
}

const CODE_TTL_MS = 60_000;
const ID_TOKEN_TTL_S = 3600;

/** Starts the fake on a random loopback port. Always `stop()` it when done. */
export async function startFakeOidcProvider(
  options: FakeOidcProviderOptions,
): Promise<FakeOidcProvider> {
  const now = options.now ?? Date.now;
  const accounts = new Map(options.accounts.map((a) => [a.sub, { ...a }]));
  const codes = new Map<string, PendingCode>();

  const kid = randomUUID();
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const jwk = { ...publicKey.export({ format: 'jwk' }), kid, alg: 'RS256', use: 'sig' };

  const server = createServer((req, res) => {
    handle(req, res).catch((err: unknown) => {
      if (err instanceof OAuthError) {
        sendJson(res, err.status, { error: err.error, error_description: err.description });
      } else {
        sendJson(res, 500, { error: 'server_error', error_description: String(err) });
      }
    });
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve());
  });
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  const metadata: FakeOidcMetadata = {
    issuer: GOOGLE_ISSUER,
    authorization_endpoint: `${url}/authorize`,
    token_endpoint: `${url}/token`,
    jwks_uri: `${url}/jwks`,
    response_types_supported: ['code'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['RS256'],
    scopes_supported: ['openid', 'email', 'profile'],
    token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic'],
    code_challenge_methods_supported: ['S256'],
    claims_supported: ['iss', 'aud', 'sub', 'email', 'email_verified', 'nonce', 'name', 'picture'],
  };

  async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const requestUrl = new URL(req.url ?? '/', url);
    const route = `${req.method} ${requestUrl.pathname}`;
    switch (route) {
      case 'GET /.well-known/openid-configuration':
        return sendJson(res, 200, metadata);
      case 'GET /jwks':
        return sendJson(res, 200, { keys: [jwk] });
      case 'GET /authorize':
        return renderAccountPicker(res, requestUrl.searchParams);
      case 'GET /authorize/approve':
        return approve(res, requestUrl.searchParams);
      case 'POST /token':
        return sendJson(res, 200, await exchangeCode(req));
      default:
        return sendJson(res, 404, { error: 'not_found' });
    }
  }

  /**
   * Validates an authorization request. Failures answer 400 with an OAuth error body and never
   * redirect, because the redirect URI itself may be the thing that is wrong.
   */
  function parseAuthorizationRequest(params: URLSearchParams): AuthorizationRequest {
    if (params.get('client_id') !== options.clientId) {
      throw new OAuthError(400, 'invalid_client', 'unknown client_id');
    }
    if (params.get('redirect_uri') !== options.redirectUri) {
      throw new OAuthError(400, 'invalid_request', 'redirect_uri is not registered');
    }
    if (params.get('response_type') !== 'code') {
      throw new OAuthError(400, 'unsupported_response_type', 'only response_type=code');
    }
    if (params.get('code_challenge_method') !== 'S256' || !params.get('code_challenge')) {
      throw new OAuthError(400, 'invalid_request', 'PKCE with S256 is required');
    }
    const state = params.get('state');
    const nonce = params.get('nonce');
    if (!state) throw new OAuthError(400, 'invalid_request', 'state is required');
    if (!nonce) throw new OAuthError(400, 'invalid_request', 'nonce is required');
    return {
      redirectUri: options.redirectUri,
      state,
      nonce,
      codeChallenge: params.get('code_challenge') ?? '',
      scope: params.get('scope') ?? '',
    };
  }

  function renderAccountPicker(res: ServerResponse, params: URLSearchParams): void {
    parseAuthorizationRequest(params);
    const items = [...accounts.values()]
      .map((account) => {
        const approveParams = new URLSearchParams(params);
        approveParams.set('sub', account.sub);
        return `<li><a href="/authorize/approve?${escapeHtml(approveParams.toString())}" data-sub="${escapeHtml(account.sub)}">${escapeHtml(account.name)} (${escapeHtml(account.email)})</a></li>`;
      })
      .join('\n');
    sendHtml(
      res,
      200,
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Choose an account</title></head><body><h1>Choose an account</h1><ul>\n${items}\n</ul></body></html>`,
    );
  }

  function approve(res: ServerResponse, params: URLSearchParams): void {
    const request = parseAuthorizationRequest(params);
    const account = accounts.get(params.get('sub') ?? '');
    if (!account) throw new OAuthError(400, 'invalid_request', 'unknown account');
    const code = randomBytes(32).toString('base64url');
    codes.set(code, { request, account, expiresAt: now() + CODE_TTL_MS });
    const callback = new URL(request.redirectUri);
    callback.searchParams.set('code', code);
    callback.searchParams.set('state', request.state);
    res.writeHead(302, { location: callback.toString() }).end();
  }

  async function exchangeCode(req: IncomingMessage): Promise<Record<string, unknown>> {
    const form = new URLSearchParams(await readBody(req));
    authenticateClient(req, form);
    const code = form.get('code') ?? '';
    const pending = codes.get(code);
    // Single-use: a code is spent by the first attempt to redeem it, successful or not.
    codes.delete(code);
    if (!pending) throw new OAuthError(400, 'invalid_grant', 'unknown or already used code');
    if (now() >= pending.expiresAt) throw new OAuthError(400, 'invalid_grant', 'code expired');
    const { request, account } = pending;
    if (form.get('redirect_uri') !== request.redirectUri) {
      throw new OAuthError(400, 'invalid_grant', 'redirect_uri does not match the authorization');
    }
    if (s256(form.get('code_verifier') ?? '') !== request.codeChallenge) {
      throw new OAuthError(400, 'invalid_grant', 'PKCE verification failed');
    }
    const issuedAt = Math.floor(Date.now() / 1000);
    const idToken = signRs256Jwt(
      { alg: 'RS256', kid, typ: 'JWT' },
      {
        iss: GOOGLE_ISSUER,
        aud: options.clientId,
        azp: options.clientId,
        sub: account.sub,
        email: account.email,
        email_verified: account.emailVerified,
        nonce: request.nonce,
        name: account.name,
        picture: account.picture,
        iat: issuedAt,
        exp: issuedAt + ID_TOKEN_TTL_S,
      },
      privateKey,
    );
    return {
      access_token: randomBytes(32).toString('base64url'),
      token_type: 'Bearer',
      expires_in: ID_TOKEN_TTL_S,
      scope: request.scope,
      id_token: idToken,
    };
  }

  /** Accepts `client_secret_basic` or `client_secret_post`, like Google. */
  function authenticateClient(req: IncomingMessage, form: URLSearchParams): void {
    let id = form.get('client_id');
    let secret = form.get('client_secret');
    const authorization = req.headers.authorization;
    if (authorization?.startsWith('Basic ')) {
      const decoded = Buffer.from(authorization.slice('Basic '.length), 'base64').toString('utf8');
      const separator = decoded.indexOf(':');
      // RFC 6749 §2.3.1: both halves are form-urlencoded, so '+' means a space.
      const formDecode = (v: string) => decodeURIComponent(v.replaceAll('+', ' '));
      id = formDecode(decoded.slice(0, separator));
      secret = formDecode(decoded.slice(separator + 1));
    }
    if (id !== options.clientId || secret !== options.clientSecret) {
      throw new OAuthError(401, 'invalid_client', 'client authentication failed');
    }
  }

  async function signIn(authorizationUrl: URL | string, sub: string): Promise<URL> {
    const page = await fetch(authorizationUrl);
    const html = await page.text();
    if (!page.ok) throw new Error(`Authorization page returned ${page.status}: ${html}`);
    const match = new RegExp(`<a href="([^"]+)" data-sub="${escapeRegExp(escapeHtml(sub))}"`).exec(
      html,
    );
    if (!match) throw new Error(`No account with sub ${sub} on the authorization page`);
    const approval = await fetch(new URL(unescapeHtml(match[1]), url), { redirect: 'manual' });
    const location = approval.headers.get('location');
    if (approval.status !== 302 || !location) {
      throw new Error(`Approval returned ${approval.status}: ${await approval.text()}`);
    }
    return new URL(location);
  }

  function updateAccount(sub: string, changes: Partial<Omit<FakeOidcAccount, 'sub'>>): void {
    const account = accounts.get(sub);
    if (!account) throw new Error(`No account with sub ${sub}`);
    accounts.set(sub, { ...account, ...changes });
  }

  async function stop(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
      server.closeAllConnections();
    });
  }

  return { url, metadata, signIn, updateAccount, stop };
}

/** A compact JWS (RFC 7515) signed with RSASSA-PKCS1-v1_5 SHA-256, i.e. JWT alg `RS256`. */
function signRs256Jwt(header: object, payload: object, key: KeyObject): string {
  const encode = (part: object) => Buffer.from(JSON.stringify(part)).toString('base64url');
  const signingInput = `${encode(header)}.${encode(payload)}`;
  const signature = sign('sha256', Buffer.from(signingInput), key).toString('base64url');
  return `${signingInput}.${signature}`;
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res
    .writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' })
    .end(JSON.stringify(body));
}

function sendHtml(res: ServerResponse, status: number, body: string): void {
  res.writeHead(status, { 'content-type': 'text/html; charset=utf-8' }).end(body);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function unescapeHtml(value: string): string {
  return value
    .replaceAll('&#39;', "'")
    .replaceAll('&quot;', '"')
    .replaceAll('&gt;', '>')
    .replaceAll('&lt;', '<')
    .replaceAll('&amp;', '&');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** S256 code challenge for a PKCE verifier (RFC 7636). */
function s256(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url');
}

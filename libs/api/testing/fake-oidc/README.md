# api-testing-fake-oidc

`@shelvio/api/testing/fake-oidc` (`scope:api`, `type:testing`): a fake of Google's OIDC HTTP surface on a random loopback port, so the Identity integration tests and the e2e stack run the real `openid-client` code flow without Google.

It is **test-only**. The module-boundary rule in the root `eslint.config.mjs` lets only `*.spec.*` / `*.test.*` files import a `type:testing` library, so it never reaches a production bundle.

## Use

```ts
import * as client from 'openid-client';
import { startFakeOidcProvider } from '@shelvio/api/testing/fake-oidc';

const provider = await startFakeOidcProvider({
  clientId,
  clientSecret,
  redirectUri, // the only one accepted, compared exactly
  accounts: [{ sub, email, emailVerified: true, name, picture }],
  // optional: now, an epoch-ms clock for code expiry (codes live 60 s). ID token iat/exp always use
  // real time, because openid-client checks them against the real clock.
});

// Google's discovery would reject the loopback URL, so hand openid-client the metadata directly.
const config = new client.Configuration(provider.metadata, clientId, clientSecret);
client.allowInsecureRequests(config); // the fake speaks plain HTTP

const callbackUrl = await provider.signIn(authorizationUrl, sub); // what a click on the account does
// ...then client.authorizationCodeGrant(config, callbackUrl, { pkceCodeVerifier, expectedState, expectedNonce })

provider.updateAccount(sub, { email, name, picture }); // the person changed their Google profile; later sign-ins carry it
await provider.stop();
```

## Endpoints

| Path                                | What it does                                                                                                                                                                  |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/.well-known/openid-configuration` | Discovery metadata (`provider.metadata`): issuer `https://accounts.google.com`, endpoints on loopback.                                                                        |
| `/authorize`                        | Validates `client_id`, the exact `redirect_uri`, `response_type=code`, PKCE S256, `state` and `nonce` (400 without redirecting otherwise), then lists the accounts as links.  |
| `/authorize/approve`                | Following an account's link issues a single-use code and redirects to the redirect URI with `code` and `state`.                                                               |
| `/token`                            | Authenticates the client (`client_secret_post` or `client_secret_basic`), checks the code, its expiry, the redirect URI and the PKCE verifier, and returns an RS256 ID token. |
| `/jwks`                             | The public key that verifies the ID tokens (a new key pair per start).                                                                                                        |

ID token claims: `iss`, `aud`, `azp`, `sub`, `email`, `email_verified`, `nonce`, `name`, `picture`, `iat`, `exp`. Errors follow OAuth: `invalid_client` (401), `invalid_grant` (400).

Run `nx test api-testing-fake-oidc` to execute the tests.

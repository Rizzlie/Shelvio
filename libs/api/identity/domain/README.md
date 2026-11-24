# api-identity-domain

`@shelvio/api/identity/domain` (`scope:api`, `type:domain`): the Identity module's domain operations (ADR-0001). Signing in with Google behind the admission gate, as plain TypeScript with Drizzle persistence inside and no Nest imports, so the REST adapter (`@shelvio/api/identity/feature`) and the later MCP server call the same code.

Identity owns the `users`, `sessions` and `sign_in_attempts` tables in `@shelvio/api/db`; no other module touches them.

## Operations

`new Identity({ db, google, signupAllowlist, accountHooks, clock, logger })`:

- `beginSignIn({ returnTo })` → the Google authorisation URL. Stores the attempt (state, PKCE S256 verifier, nonce, `returnTo`) for 10 minutes, single-use. `returnTo` is kept only if it is a path in the web app (one leading `/`, not `//` or `/\`, no control characters), otherwise `/`.
- `completeSignIn(callbackParams)` → `{ user, returnTo, session: { token, expiresAt } }`. Exchanges the code with `openid-client` (ID token, state, PKCE and nonce verified), then:
  - `Forbidden('auth.emailNotVerified')` unless Google verified the email;
  - a known Google account (`sub`) signs in without the admission gate, even off the allowlist, and its name, avatar and lowercased email are refreshed from the ID token. If another account already holds the new email, the old one is kept, the sign-in goes on and `logger.warn` reports it (user id only, never tokens);
  - someone new passes the admission gate (email on `signupAllowlist`, compared lowercased, or `accountHooks.isInvited(email)`), or gets `Forbidden('auth.inviteOnly')` and no account;
  - `accountHooks.afterSignIn(user)` runs on every successful sign-in, with the refreshed profile;
  - a new session starts, valid for 30 days. Its raw token is returned this once; the `sessions` table keeps only its SHA-256 hash.

  A callback that doesn't prove a fresh Google sign-in (unknown, used or expired state, PKCE or nonce mismatch, an error from Google) is `Unauthenticated('auth.unauthenticated')`: start again.

- `resolveSession(token)` → the `Actor` (`{ userId }`) every operation acting for a person receives, or `Unauthenticated('auth.unauthenticated')` for an unknown or expired token.
- `getMe(actor)` → the signed-in person's `User` (id, email, name, avatar URL).

## Seams

- **`GoogleOidc`**: `discoverGoogle({ clientId, clientSecret, redirectUri })` in production, which runs OIDC discovery on first use, not at startup. Tests hand in the fake provider's metadata instead (see `@shelvio/api/testing/fake-oidc`).
- **`AccountHooks`**: what Identity needs from Collections & Access without importing it (`isInvited`, `afterSignIn`, `summariseAccount`, `deleteAccountData`). The API app wires the implementation; until `mvp-catalog` and `mvp-sharing` it is a no-op.
- **`Clock`**: `systemClock` in production, a fake clock in tests.
- **`IdentityLogger`**: `{ warn(message) }`; `IdentityModule` passes Nest's `Logger`, so warnings reach the API's JSON logs.

## Tests

Integration tests against a real Postgres (Testcontainers) and the fake OIDC provider, so `beginSignIn` → `completeSignIn` runs the real `openid-client` exchange. Run `nx test api-identity-domain` with Docker running.

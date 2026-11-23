# api-identity-domain

`@shelvio/api/identity/domain` (`scope:api`, `type:domain`): the Identity module's domain operations (ADR-0001). Signing in with Google behind the admission gate, as plain TypeScript with Drizzle persistence inside and no Nest imports, so the REST adapter (`@shelvio/api/identity/feature`) and the later MCP server call the same code.

Identity owns the `users`, `sessions` and `sign_in_attempts` tables in `@shelvio/api/db`; no other module touches them.

## Operations

`new Identity({ db, google, signupAllowlist, accountHooks, clock })`:

- `beginSignIn({ returnTo })` → the Google authorisation URL. Stores the attempt (state, PKCE S256 verifier, nonce, `returnTo`) for 10 minutes, single-use. `returnTo` is kept only if it is a path in the web app (one leading `/`, not `//` or `/\`, no control characters), otherwise `/`.
- `completeSignIn(callbackParams)` → `{ user, returnTo }`. Exchanges the code with `openid-client` (ID token, state, PKCE and nonce verified), then:
  - `Forbidden('auth.emailNotVerified')` unless Google verified the email;
  - a known Google account (`sub`) signs in; someone new passes the admission gate (email on `signupAllowlist`, compared lowercased, or `accountHooks.isInvited(email)`), or gets `Forbidden('auth.inviteOnly')` and no account;
  - `accountHooks.afterSignIn(user)` runs on every successful sign-in.

  A callback that doesn't prove a fresh Google sign-in (unknown, used or expired state, PKCE or nonce mismatch, an error from Google) is `Unauthenticated('auth.unauthenticated')`: start again.

## Seams

- **`GoogleOidc`**: `discoverGoogle({ clientId, clientSecret, redirectUri })` in production, which runs OIDC discovery on first use, not at startup. Tests hand in the fake provider's metadata instead (see `@shelvio/api/testing/fake-oidc`).
- **`AccountHooks`**: what Identity needs from Collections & Access without importing it (`isInvited`, `afterSignIn`, `summariseAccount`, `deleteAccountData`). The API app wires the implementation; until `mvp-catalog` and `mvp-sharing` it is a no-op.
- **`Clock`**: `systemClock` in production, a fake clock in tests.

## Tests

Integration tests against a real Postgres (Testcontainers) and the fake OIDC provider, so `beginSignIn` → `completeSignIn` runs the real `openid-client` exchange. Run `nx test api-identity-domain` with Docker running.

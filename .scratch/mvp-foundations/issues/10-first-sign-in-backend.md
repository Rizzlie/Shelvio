# 10: First sign-in (backend)

**What to build:** A person on the allowlist completes Google sign-in through the API, gets an account and a session cookie, and `GET /me` returns them; a person who is not admitted, or whose email is unverified, is refused and nothing is stored. See the spec's "Identity module" and the account-hooks decision in "Workspace and module boundaries".

**Blocked by:** 04 (Database and migrations), 05 (Contracts, domain errors and HTTP security), 09 (Fake OIDC provider).

**Status:** done

- [x] Identity `domain` and `feature` libraries; `users` table (UUIDv7, nullable `google_sub`, lowercased `email`, `name`, `avatar_url`, timestamps, `deleted_at`, partial unique indexes on `google_sub` and `email`) and `sessions` table (token hash only, `expires_at`, `last_refreshed_at`).
- [x] `beginSignIn({ returnTo })`: state, PKCE S256 verifier and nonce stored single-use with a short expiry; scopes `openid email profile`, `prompt=select_account`; `returnTo` kept only if it is a relative path (a single leading `/`, not `//` or `/\`), else `/`.
- [x] `completeSignIn`: `openid-client` code exchange with ID token, state, PKCE and nonce verification; refuses with `auth.emailNotVerified` when `email_verified` is false.
- [x] Admission gate for an unknown `sub`: email on `SIGNUP_ALLOWLIST` (case-insensitive) or account hook `isInvited(email)`; otherwise refuse with `auth.inviteOnly` and create no user.
- [x] Account-hooks interface owned by Identity (`isInvited`, `afterSignIn`, `summariseAccount`, `deleteAccountData`), wired by the API app to a no-op implementation; `afterSignIn` is called on every successful sign-in.
- [x] A session is created (30-day expiry) and its raw token returned once; `resolveSession(token)` returns the actor or `Unauthenticated` for unknown or expired tokens; a Nest guard resolves the actor.
- [x] HTTP: the start-sign-in route redirects to Google; the callback sets `__Host-session` (`HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, no `Domain`) and redirects to `returnTo`, or to the no-access screen on refusal; `GET /me` returns id, name, email and avatar URL, or 401.
- [x] Operation-level integration tests with real Postgres and the fake OIDC provider cover: allowlist admission, refusal (no row created), `isInvited` admission via a test hook, unverified email, `returnTo` validation, state/nonce/PKCE mismatch, the `afterSignIn` call. HTTP tests cover cookie attributes and `/me` 401/200.

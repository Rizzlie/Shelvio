# Sign-in for local development and e2e tests

Type: grilling
Status: resolved
Blocked by: none
Map: [Shelvio MVP](../map.md)

## Question

How do local development and Playwright e2e tests get a signed-in session without going through real Google sign-in, and how is that path kept out of production?

Known so far:
- [Authentication and sessions](08-authentication.md): server-side Google OIDC code flow in Nest, opaque DB-backed sessions in a `__Host-session` cookie, invite-only gate at account creation, `GET /me` on bootstrap.
- The user has an existing solution to share.

Decide:
- the mechanism (e.g. a dev-only sign-in endpoint, a fake OIDC provider, seeded sessions, Playwright `storageState`),
- how test users, their roles and their collections are seeded,
- how the mechanism is guaranteed absent or disabled in production,
- how the cookie works on `localhost` (the `__Host-` prefix needs `Secure`).

## Answer

Adopt the model from the user's earlier project [Daylo](https://github.com/Rizzlie/Daylo) (`apps/web-e2e/environment/`, `apps/api/e2e/main.ts`): replace only Google's HTTP surface in e2e; local development uses real Google.

**Local development.** `npm run dev` signs in through real Google with a separate development OAuth client whose callback is `http://localhost:4200/api/auth/...`, and the developer's email on the allowlist. The API has no test sign-in route or provider switch at all. The cookie keeps its production name `__Host-session` over plain `http://localhost` (Chromium/Firefox accept `Secure` on loopback; Safari locally is not supported). Angular's dev-server proxy forwards `/api` to Nest, so frontend and API are same-origin locally.

**E2E stack.** A runner target (`e2e-fullstack`) creates, for each run, under a random run id:
- an isolated Postgres container (tmpfs, run-scoped name/label) and an isolated MinIO container, both removed on cleanup after their identity is verified;
- Drizzle migrations, then the seed;
- a fake OIDC provider on a random loopback port: `authorize` (a page listing the synthetic accounts), `token` (an RS256 ID token with `iss=https://accounts.google.com`, `aud`, `sub`, `email`, `email_verified`, `nonce`) and a JWKS endpoint. It validates client id/secret, redirect URI, PKCE S256, `state` and `nonce`, and codes are single-use with a short expiry;
- the API from a **separate e2e-only entrypoint**, then the built frontend.

Tests sign in through the real browser flow (click "Sign in with Google", choose an account), so the callback, ID-token verification, admission gate and session creation are production code.

**Keeping it out of production.** The e2e entrypoint is the only place that swaps the `openid-client` configuration (server metadata pointing at the fake provider; issuer still Google) and wires the fake lookup sources ([Lookup module and external API proxying](22-lookup-module.md)). It is not part of the normal API bundle and refuses to start unless `NODE_ENV=test`, the database is `127.0.0.1/<db>_e2e_<runId>` and the provider is on loopback. Production has no switch, flag or endpoint for this.

**Synthetic accounts, seeded once per run:** `owner` (on the allowlist, owns the seed collection), `contributor` and `viewer` (Shares to the seed collection), `invited` (an Invitation, no account yet: exercises conversion on first sign-in) and `outsider` (refused). Tests create their own items, shelves, tags and collections as the signed-in actor through the UI or API. A test that changes roles, Shares or Invitations creates its own collection and never mutates the seeded ones. A Playwright fixture `actors.login(account)` gives each actor a fresh browser context.

**Manual multi-role checks.** An `e2e-fullstack:inspect` mode starts the same stack and waits, so the developer can browse as any synthetic account.

**Browsers.** E2E runs on Chromium only (desktop and mobile emulation). Workers, sharding and CI are left to [Deployment pipeline and environments](24-deployment-pipeline.md).

No glossary terms. No ADR: test infrastructure, cheap to change.

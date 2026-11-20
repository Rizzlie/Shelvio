# Authentication and sessions

Type: grilling
Status: resolved
Blocked by: none
Map: [Shelvio MVP](../map.md)

## Question

How does Google sign-in work end to end between Angular and NestJS?

Decide:
- the OAuth flow (server-side authorisation code flow via Passport in Nest vs. Google Identity Services in the browser, with the ID token verified by Nest),
- the session mechanism (httpOnly cookie session vs. JWT access/refresh tokens) and its lifetime,
- what identifies a user (the Google subject ID, with email as an attribute) and what profile data is stored,
- whether sign-in is open to anyone with a Google account or limited (allowlist / invite-only), given this is for the user and friends.

## Answer

**OAuth flow.** Server-side authorisation code flow with `state` and PKCE, run by NestJS through `openid-client` (full OIDC, ID token verified), no Passport. The logic lives in **Identity** domain operations; the controller is a thin adapter. The client secret stays on the backend.

**Sessions.** Opaque random token in a cookie; a `sessions` table in Postgres stores its hash. Lifetime 30 days, sliding (refreshed at most once a day). Many sessions per user (devices). Sign-out deletes the current session only. Expired sessions are swept periodically. No JWT; token-based access for the future MCP server is a separate, later concern.

**Domain and cookies.** A custom domain (the user buys it before deployment): `app.<domain>` → Cloudflare Pages, `api.<domain>` → Render, `img.<domain>` → R2. Frontend and API are then same-site, so the cookie is `__Host-session` (`httpOnly`, `Secure`, `SameSite=Lax`, no `Domain`, host-only to `api.`). CORS allows only the `app.` origin with credentials. Every state-changing request (POST/PUT/PATCH/DELETE) has its `Origin` header checked against that origin; no CSRF tokens.

**Identity.** Internal user id is UUIDv7; the Google account is identified by its `sub` (unique). Email is an attribute: stored lowercased with a unique index, updated on every sign-in; sign-in is refused unless `email_verified` is true. Stored profile: name and avatar URL only; no profile editing in the MVP. If an updated Google email collides with another user's email, the old email is kept, sign-in proceeds, and a warning is logged.

**Who may sign in (invite-only).** An account may be created only when the email is on an allowlist (environment variable) or has a pending or accepted invitation; Identity asks Collections & Access through its public operation. The gate is checked only at account creation (first sign-in); later sign-ins match by `sub`. An account, once created, stays even if it loses all shares. A refused person sees a translated "Shelvio is invite-only" message.

**Frontend.** On bootstrap the app calls `GET /me`; 401 shows a public sign-in screen ("Sign in with Google"). An HTTP interceptor sends any 401 to that screen. The intended URL travels as `returnTo`, stored with the OAuth `state` and restored after sign-in; only relative paths are accepted (no open redirect).

**Deferred.** Sign-in for local development and Playwright e2e tests: the user has an existing solution to share later (moved to the map's Not yet specified).

No glossary terms or ADR: nothing here is hard to reverse.

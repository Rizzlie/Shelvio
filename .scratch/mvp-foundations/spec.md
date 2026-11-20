# MVP foundations

Status: ready-for-agent
Spec: 1 of 4 for the Shelvio MVP (followed by `mvp-catalog`, `mvp-browse`, `mvp-sharing`; each later spec assumes this one is implemented)
Map: [Shelvio MVP](../shelvio-mvp/map.md)
Sources: map tickets [04 Hosting and file storage](../shelvio-mvp/issues/04-hosting-and-storage.md), [08 Authentication and sessions](../shelvio-mvp/issues/08-authentication.md), [14 Translation approach](../shelvio-mvp/issues/14-i18n-approach.md), [15 Technical foundations](../shelvio-mvp/issues/15-foundations.md), [20 UI brief and theme](../shelvio-mvp/issues/20-ui-brief-and-theme.md), [23 Sign-in for local development and e2e tests](../shelvio-mvp/issues/23-dev-and-e2e-sign-in.md), [24 Deployment pipeline and environments](../shelvio-mvp/issues/24-deployment-pipeline.md), [25 Account lifecycle](../shelvio-mvp/issues/25-account-lifecycle.md); ADR-0001 to ADR-0005; [UI README](../shelvio-mvp/ui/README.md), [UI brief](../shelvio-mvp/ui/ui-brief.md), [theme decisions](../shelvio-mvp/ui/theme-decisions.md)

## Problem Statement

Shelvio does not exist yet: there is no workspace, no backend, no frontend and no way to sign in. The person who wants to keep records of their books and vinyl records with friends cannot open the app at all, and every later feature (collections and items, browsing, sharing) would have to invent its own answers to the same cross-cutting questions: how a person gets in and stays signed in, who is allowed in, how the app looks in light and dark mode, how text is translated and how dates and money are formatted, how errors reach the screen, how the database schema evolves, and how the whole thing is tested and checked on every pull request.

The developer, in turn, needs a codebase where the architectural decisions already taken (modular monolith with domain operations, invite-only Google sign-in, Transloco, the M3 theme, ephemeral e2e stacks, migrations at startup) are built once and enforced by tooling, so later features only add domain behaviour.

The operator (the person running Shelvio for their friends) needs a way to delete someone's account on request, because the MVP has no self-service deletion.

## Solution

A working, signed-in empty shell of Shelvio that runs locally with green CI:

- A person whose email is on the allowlist opens the app, sees a Polish sign-in card, clicks "Zaloguj przez Google", signs in with Google and lands in the app shell (sidebar with the theme switch and their avatar, name and email, a top bar, an empty content area). They stay signed in for 30 days of activity on that device and can sign out.
- A person who is not admitted sees "Shelvio działa na zaproszenia. Poproś właściciela kolekcji o dostęp." and no account is created for them.
- Any link opened while signed out brings the person back to that page after sign-in.
- The app follows the system light/dark mode by default, with a Jasny / Ciemny / Systemowy switch, uses the "Warm Editorial Archival" look on Angular Material 3, and all text is Polish and goes through Transloco.
- A public "O aplikacji" page and generic "Nie znaleziono" (404) and "Brak dostępu" screens exist.
- The operator can delete an account with a CLI command that shows a summary and asks for confirmation; the user becomes an anonymised tombstone and all their sessions end.
- Under the hood: the Nx workspace with enforced module boundaries, the Identity module built on the domain-operations pattern, shared Zod contracts, `problem+json` errors, a Zod-validated config, Drizzle with migrations applied at startup, an in-process daily job runner, `/health` and JSON logs, a self-contained e2e stack with a fake Google OIDC provider and seeded synthetic accounts, and a GitHub Actions pipeline.

## User Stories

### Signing in and staying signed in

1. As an admitted person, I want to sign in with my Google account, so that I don't need another password for Shelvio.
2. As a person opening Shelvio while signed out, I want to see a centered card with the Shelvio wordmark, one tagline and a "Zaloguj przez Google" button, so that it is obvious how to get in.
3. As a person on the sign-in screen, I want a small "O aplikacji" link under the card, so that I can learn what Shelvio is and where its data comes from before signing in.
4. As a person signing in, I want Google to let me choose which Google account to use, so that I can switch to the account my invitation was made for.
5. As a person signing in for the first time whose email is on the allowlist, I want an account to be created for me automatically, so that I can start using Shelvio straight away.
6. As a person signing in for the first time whose email has an Invitation, I want to be admitted, so that the person who invited me doesn't have to do anything more (the Invitation part is completed by `mvp-sharing`).
7. As a person who is neither on the allowlist nor invited, I want a clear Polish message that Shelvio is invite-only and that I should ask a collection's owner for access, so that I know why I can't get in and what to do.
8. As a refused person, I want a button that takes me back to the sign-in screen, so that I can try a different Google account.
9. As a refused person, I want no account to be created for me, so that nothing about me is stored.
10. As a person whose Google email is not verified, I want sign-in to be refused, so that nobody can claim my email address through an unverified Google account.
11. As a returning user, I want to be recognised by my Google account even if my Google email changed, so that I keep my account and everything shared with me.
12. As a returning user, I want my name, email and avatar refreshed from Google on every sign-in, so that people see my current details without me editing a profile.
13. As a returning user whose new Google email is already used by another Shelvio account, I want to still be signed in, so that a rare collision doesn't lock me out (my old email is kept and the operator sees a warning in the logs).
14. As a returning user, I want an account that was admitted once to stay usable even if I later lose every Share, so that I am not silently locked out.
15. As a signed-in user, I want to stay signed in for 30 days after my last activity on a device, so that I don't have to sign in every time I open Shelvio.
16. As a signed-in user, I want to be signed in independently on several devices, so that using my phone doesn't sign me out on my laptop.
17. As a signed-in user, I want to sign out from the sidebar, so that I can leave a shared computer safely.
18. As a user signing out, I want only the current device's session to end, so that my other devices stay signed in.
19. As a person who opened a deep link (e.g. a collection link from an invitation message) while signed out, I want to land on that page after signing in, so that I don't have to find it again.
20. As a user whose session expired while the app was open, I want to be sent to the sign-in screen and returned afterwards, so that an expired session doesn't look like a broken app.
21. As a user, I want a link that tries to send me to another website after sign-in to be ignored, so that Shelvio cannot be used to redirect me to a phishing page.

### App shell and screens

22. As a signed-in user, I want a desktop sidebar with my avatar, name and email and a sign-out icon at the bottom, so that I always know which account I'm using.
23. As a signed-in user on a phone, I want the sidebar to become a drawer behind a hamburger button, so that the content has the full width.
24. As a signed-in user, I want a top bar that later holds search and "Dodaj", so that the layout stays stable as features arrive.
25. As a user, I want an "O aplikacji" link in the sidebar's account area, so that I can find the data sources and the rights-holder contact at any time.
26. As anyone, including someone who is not signed in, I want a public "O aplikacji" page with the Discogs non-affiliation notice, credits to Biblioteka Narodowa, e-ISBN, Open Library, MusicBrainz and Cover Art Archive, and a contact address for rights holders, so that Shelvio meets its attribution duties.
27. As a user who opens an address that doesn't exist or that I may not see, I want the screen "Nie znaleziono — ta kolekcja lub pozycja nie istnieje albo nie masz do niej dostępu.", so that I get the same answer whether a thing is missing or hidden from me.
28. As a user who tries something my role doesn't allow, I want a translated error message, so that I understand the action was refused.
29. As a user, I want any error from the server shown as a Polish message, so that I never see raw technical text.

### Look and feel

30. As a user, I want Shelvio to follow my system's light or dark mode by default, so that it matches the rest of my device.
31. As a user, I want a Jasny / Ciemny / Systemowy switch in the sidebar (in the drawer on mobile), so that I can override the system mode.
32. As a user, I want my mode choice remembered in this browser, so that I don't have to set it every visit.
33. As a person on the sign-in, no-access or 404 screens, I want them to follow my stored or system mode too, so that the app doesn't flash a different theme before sign-in.
34. As a user, I want a warm, paper-like light theme and a warm-charcoal dark theme (never neutral grey or pure black) with one deep-green accent, so that the app feels calm and covers stand out.
35. As a user, I want Polish characters to render correctly in both typefaces (Newsreader for headings, Plus Jakarta Sans for everything else), so that titles and names look right.
36. As a user relying on a keyboard or a screen reader, I want accessible contrast and visible focus rings, so that I can use Shelvio comfortably.

### Language and formatting

37. As a Polish user, I want every piece of interface text in Polish with correct diacritics, so that the app reads naturally.
38. As a user, I want dates always shown as `14.05.2022`, so that dates look the same everywhere.
39. As a user, I want to type a date as `14.05.2022` in a date field and have it understood, so that I don't have to use the picker.
40. As a user, I want money shown in the Polish standard ("1420,00 zł", "14 200,00 zł"), so that amounts look familiar.
41. As a user, I want to enter an amount with either a comma or a dot, so that both habits work.
42. As a user, I want counts in text to use correct Polish plural forms ("1 pozycja, 2 pozycje, 5 pozycji"), so that the text is grammatical.
43. As a user, I want ISBNs shown hyphenated by publisher ranges, so that they are easy to read and compare with the book.
44. As a future non-Polish user, I want all text to already go through the translation layer, so that adding my language later is just a translation file and a picker.

### Operator

45. As the operator, I want to admit the first people by putting their emails on an allowlist in the configuration, so that the first collection owners can sign in before any Invitations exist.
46. As the operator, I want to delete a user's account with one CLI command given their email, so that I can honour a deletion request without touching the database by hand.
47. As the operator, I want the command to show a summary of what will be deleted (the account, and in later specs their owned collections, item counts and the people with access) and ask for confirmation, so that I don't delete the wrong account.
48. As a user whose account was deleted, I want my name, email, avatar and Google identity removed and all my sessions ended, so that Shelvio no longer holds my personal data.
49. As a user whose account was deleted, I want signing in again to be treated as a brand-new first sign-in through the invite-only gate, so that nothing is silently restored.
50. As the operator, I want a health endpoint that checks the database, so that I (and later a host) can see whether the API is working.
51. As the operator, I want structured JSON logs, so that problems can be searched and filtered.

### Developer

52. As a developer, I want to start the whole app locally with one command and sign in through real Google with a development OAuth client, so that local behaviour matches production.
53. As a developer, I want local Postgres and MinIO from `docker-compose`, so that I don't need cloud accounts to develop.
54. As a developer, I want the frontend and API to be same-origin locally through the dev-server proxy, so that cookies and CORS behave without special cases.
55. As a developer, I want the API to refuse to start when configuration is missing or invalid, with a message naming the variable, so that misconfiguration fails fast.
56. As a developer, I want a committed `.env.example` listing every variable, so that setting up a machine is copying one file.
57. As a developer, I want module boundaries enforced by lint, so that frontend and backend never import each other and modules only talk through public interfaces.
58. As a developer, I want each backend module to expose HTTP-agnostic domain operations that receive the acting user, so that the future MCP server can reuse them with the same rules.
59. As a developer, I want typed domain errors mapped in one place to `problem+json` with a code and parameters, so that every feature reports errors the same way.
60. As a developer, I want REST contracts defined once as Zod schemas shared by Nest validation and the Angular client, so that the two sides can't drift.
61. As a developer, I want to change the Drizzle schema, generate a migration and commit it, and have it applied automatically when the API starts, so that schema changes need no manual steps.
62. As a developer, I want CI to fail when the schema has changes without a generated migration, so that nobody forgets to commit one.
63. As a developer, I want two API instances starting at once to apply migrations only once, so that a later multi-instance deploy is safe.
64. As a developer, I want to register a periodic job that runs at most once a day, so that sweeps don't need a queue or Redis.
65. As a developer, I want e2e tests to run against a fresh, isolated Postgres and MinIO per run, so that tests never share or leak state.
66. As a developer, I want e2e tests to sign in through the real browser flow against a fake Google, so that the callback, ID-token verification, admission gate and session creation are tested as production code.
67. As a developer, I want a Playwright fixture that logs in as any synthetic account in a fresh browser context, so that multi-role tests are short.
68. As a developer, I want an inspect mode that starts the e2e stack and waits, so that I can click through the app as any synthetic account by hand.
69. As a developer, I want a guarantee that the fake sign-in can never run outside a test environment, so that production has no backdoor.
70. As a developer, I want every pull request checked for commit conventions, lint, unit/integration tests, build, missing translation keys and affected e2e, so that `main` stays green.
71. As a developer, I want stale CI runs on the same pull request cancelled, so that CI time isn't wasted.
72. As a developer, I want Playwright reports uploaded when e2e fails, so that I can see what broke.
73. As a developer, I want lint to flag hard-coded text in templates and CI to flag missing or unused translation keys, so that no untranslated text ships.
74. As a developer, I want a fake clock in tests, so that session sliding, expiry and the daily job guard are tested without waiting.

## Implementation Decisions

### Workspace and module boundaries

- One Nx monorepo with apps `web` (Angular) and `api` (NestJS); `mcp` is a later app. A separate Playwright e2e project owns the `e2e-fullstack` target.
- Backend modules per ADR-0001: Identity, Collections & Access, Catalog, Metadata Lookup, Media. This spec builds **Identity** fully. The other modules are created by the specs that need them (`mvp-catalog`, `mvp-sharing`); this spec only fixes the conventions they follow.
- Each backend module is two libraries: `domain` (operations, rules, Drizzle persistence inside, no repository seam) and `feature` (Nest module and thin controllers).
- One `db` library holds all Drizzle tables and the single migration stream. A module touches only its own tables and reaches other modules' data through their operations.
- One `shared/contracts` library holds REST contracts as Zod schemas, the shared enum consts and the error-code vocabulary; used for Nest validation (`nestjs-zod`), the typed Angular client, OpenAPI, and later MCP tool input schemas.
- `@nx/enforce-module-boundaries` with the tags and rules from ticket 15: `scope:web` and `scope:api` never depend on each other, both may depend on `scope:shared`; frontend `shell → feature, data-access, ui, util`, `feature → data-access, ui, util`, `data-access → util`, `ui → ui, util`, `util → util`; backend `feature → domain, util`, `domain → domain, data-access, util`, `data-access → util`; `shared/contracts` is `type:util` + `scope:shared`.
- Cross-module calls are direct calls to another module's public interface; no event bus.
- **Identity does not import Collections & Access.** Collections & Access will need to look users up by email and show profiles (so it depends on Identity), and Identity needs Access at sign-in and account deletion. To avoid a library cycle, Identity defines and owns a narrow **account-hooks** interface that the API app wires to an implementation:
  - `isInvited(email)`: whether a pending Invitation opens the admission gate;
  - `afterSignIn(user)`: run on every successful sign-in, after the email refresh (used by `mvp-sharing` to convert Invitations into Shares);
  - `summariseAccount(userId)`: lines for the deletion summary (owned collections, item counts, people with access);
  - `deleteAccountData(userId, tx)`: remove what the user owns and their Shares inside Identity's deletion transaction.
  In this spec the wired implementation is a no-op (not invited, nothing to convert, empty summary, nothing to delete). `mvp-catalog` and `mvp-sharing` replace it with the Collections & Access implementation and extend the corresponding tests.
- Seams with swappable adapters only where two adapters exist (ADR-0001): this spec introduces the **clock**. File storage and metadata sources are introduced by `mvp-catalog`.

### Domain operations and errors

- Operations are plain TypeScript classes; every operation that acts for a person receives the acting user. Nest guards only check authentication and resolve the actor from the session; permissions are checked inside operations (later specs, via Collections & Access).
- Typed domain errors: `NotFound`, `Forbidden`, `Conflict`, `ValidationFailed`, plus `Unauthenticated` for the HTTP layer. One Nest exception filter maps them, and Zod validation failures, to `application/problem+json` carrying a stable `code` and `params`. The API never returns translated text.
- Error codes are a shared const in contracts so the frontend can key translations by them and the MCP adapter can map them later.

### Identity module

**Data.**
- `users`: UUIDv7 id; `google_sub`, `email` (lowercased), `name`, `avatar_url`, all nullable to allow tombstones; `created_at`, `updated_at`, `deleted_at`. Unique indexes on `google_sub` and `email` are partial (only non-null / non-deleted rows).
- `sessions`: UUIDv7 id, `user_id`, hash of the opaque token (the raw token is never stored), `created_at`, `expires_at`, `last_refreshed_at`. Many per user.
- `oauth` sign-in attempts (state, PKCE verifier, nonce, validated `returnTo`, short expiry) are kept server-side, keyed by `state`, single-use. Where they live (table or signed short-lived cookie) is left to the implementer as long as they are single-use and expire within minutes.

**Operations** (names indicative):
- `beginSignIn({ returnTo })` → the Google authorisation URL. Generates `state`, PKCE S256 verifier and `nonce`; stores them with `returnTo` only if `returnTo` is a relative path (starts with a single `/`, not `//` or `/\`), otherwise stores `/`. Requests scopes `openid email profile` and `prompt=select_account` so a refused person can pick another account.
- `completeSignIn(callbackParams)` → `{ sessionToken, returnTo }` or a typed refusal. Uses `openid-client` (full OIDC, ID token verified, no Passport) to exchange the code, verifying `state`, PKCE and `nonce`. Then:
  - refuse with `auth.emailNotVerified` unless `email_verified` is true;
  - find the user by `sub`. If found: refresh name and avatar; refresh the lowercased email unless another user already holds it, in which case keep the old email and log a warning;
  - if not found: run the **admission gate**: the email is on the allowlist (config, compared lowercased) or `isInvited(email)` is true. Otherwise refuse with `auth.inviteOnly` and create nothing. If admitted, create the user;
  - call `afterSignIn(user)`;
  - create a session and return its raw token once.
- `resolveSession(token)` → the acting user or `Unauthenticated`. Rejects unknown, expired, or tombstoned users' sessions. **Sliding**: when the session was last refreshed more than a day ago, push `expires_at` to now + 30 days and tell the adapter to re-issue the cookie; otherwise no write.
- `signOut(token)` deletes only that session.
- `getMe(actor)` → id, name, email, avatar URL. No profile editing.
- `deleteAccount(email)` and `summariseAccount(email)` for the operator: see "Account deletion".
- `sweepExpiredSessions()` deletes expired sessions; registered as a daily job.

**HTTP adapter.**
- Routes under the `/api` prefix: start sign-in (redirect to Google), OAuth callback (sets the cookie and redirects to `returnTo`, or to the no-access screen on `auth.inviteOnly` / `auth.emailNotVerified`), sign-out (POST), `GET /me` (401 when signed out).
- Cookie `__Host-session`: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, no `Domain`, Max-Age matching the session's expiry; cleared on sign-out. The same name is used on `http://localhost` (Chromium and Firefox accept `Secure` on loopback; local Safari is unsupported).
- CORS allows only `APP_ORIGIN` with credentials. Every POST/PUT/PATCH/DELETE must carry an `Origin` header equal to `APP_ORIGIN`; a missing or different Origin is rejected with 403. No CSRF tokens.
- Production targets a custom domain (`app.` → Cloudflare Pages, `api.` → Render, `img.` → R2), making app and API same-site; that setup itself is out of scope, but nothing in the code may assume a single origin beyond `APP_ORIGIN`.

### Account deletion (operator only)

- An Nx target on the API (e.g. `delete-account --email=…`) boots the application context without HTTP, prints `summariseAccount` (the user's id, name, email, session count, plus the hook's lines), asks for an interactive confirmation, then calls `deleteAccount`.
- `deleteAccount`, in one transaction: calls `deleteAccountData(userId, tx)` (no-op in this spec; later hard-deletes owned collections, soft-deleted ones included, with everything in them, and the user's Shares, per the ADR-0003 amendment); hard-deletes all the user's sessions; turns the user row into a tombstone (same id; `name`, `email`, `avatar_url`, `google_sub` set to NULL; `deleted_at` set). `*_by_user_id` and `invited_by` references keep pointing at the tombstone; no FK uses `SET NULL`.
- Deleting an unknown or already deleted email is a `NotFound`.
- Signing in again with the same Google account matches no `sub` and no email, so it is a fresh first sign-in through the gate.

### Configuration

- One Zod schema validates environment variables at startup; missing or invalid values fail fast with the variable's name. Later specs extend the same schema.
- Variables introduced here: `NODE_ENV`, `PORT`, `DATABASE_URL`, `APP_ORIGIN`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `SIGNUP_ALLOWLIST` (comma-separated emails), `LOG_LEVEL`. `docker-compose` also provides MinIO for later specs; storage variables (`S3_ENDPOINT`, keys, bucket, `IMAGE_BASE_URL`) and lookup variables (`DISCOGS_TOKEN`, `LOOKUP_CONTACT_EMAIL`, `LOOKUP_SOURCES`) are added by `mvp-catalog`.
- The existing `.env.example` is replaced: `GOOGLE_BOOKS_API_KEY` goes (Google Books was dropped from the MVP); `DISCOGS_TOKEN` stays documented for `mvp-catalog`. `.env` stays untracked.
- The frontend holds no secrets.

### Persistence, migrations and periodic jobs

- Drizzle with Postgres. UUIDv7 primary keys for rows; `created_at`/`updated_at` on main tables; enums stored as text with CHECK constraints generated from the shared Zod consts (convention for later specs).
- Migrations are generated by `drizzle-kit generate` and committed. The API applies them with the programmatic migrator at startup, before listening, under a Postgres advisory lock. Rule **expand → contract**: each migration must work with the previous app version; destructive changes ship in a later release. No down migrations; fix forward.
- Periodic jobs run in-process: at startup and every 24 h while the process lives, each job guarded by a "last run" row (job name, last run time) so it runs at most once a day across restarts and instances; jobs must be idempotent. Registration is a small interface (name + run function) so `mvp-catalog` can add the image sweep and orphan-creator cleanup. This spec registers the expired-session sweep.
- No job queue or Redis; `pg-boss` is the upgrade path.

### Observability

- `GET /health` (unauthenticated) checks the database connection and returns 200 or 503.
- Structured JSON logs; no Sentry or uptime monitor. Secrets and session tokens are never logged.

### Frontend shell

- Standalone components, signals, new control flow; NgRx SignalStore per area; Angular Material 3. `<html lang="pl">`.
- On bootstrap the app calls `GET /me`. 401 shows the public sign-in screen, carrying the current URL as `returnTo`. An HTTP interceptor sends any later 401 to the sign-in screen the same way.
- Error handling: 404 problems on page loads show the 404 screen; other problems show a translated message keyed by the problem `code` (shared scope), with a generic fallback for unknown codes.
- Public routes: sign-in, no access ("Brak dostępu": "Shelvio działa na zaproszenia. Poproś właściciela kolekcji o dostęp." and a "Wyloguj" button that returns to the sign-in screen, since no session exists), "O aplikacji", 404. All others require a signed-in user.
- Signed-in layout per the UI brief's app shell: desktop left sidebar and top bar; mobile drawer behind a hamburger. This spec fills the sidebar's bottom area (theme switch, then avatar, name, email, sign-out icon, and an "O aplikacji" link) and provides empty slots for the navigation entries ("Wszystko", "Lista życzeń", "Moje kolekcje", "Udostępnione mi"), the top-bar search and "Dodaj" button, and the mobile FAB, which `mvp-browse`, `mvp-catalog` and `mvp-sharing` fill. Until then the signed-in landing route shows the empty shell.
- "O aplikacji" content comes from ADR-0004: the Discogs non-affiliation notice, credits to Biblioteka Narodowa, e-ISBN, Open Library, MusicBrainz and Cover Art Archive, and a contact address for rights holders (from frontend build configuration, not a secret).
- No profile page, no language picker, no "PL" badge (UI brief hard rules).

### Theme

- Angular Material M3 palettes generated from seed colors and applied with `mat.theme()`; dark mode from the same palettes via `color-scheme` / `light-dark()`. Only surface/background `--mat-sys-*` tokens are overridden by hand.
- Light seeds and surfaces, dark warm-charcoal surfaces, and color roles exactly as in theme-decisions (primary `#1b432c`, brass → `tertiary`, terracotta → `error`, custom `--shelvio-warning` for amber soft warnings; collections have no colors). The dark primary is the generated palette's dark-scheme primary, not the mockup's mid green.
- Mode switch Jasny / Ciemny / Systemowy, default Systemowy, stored in `localStorage` (wrapped so a blocked storage falls back to Systemowy), applied before first paint so pre-sign-in screens follow it too.
- Fonts self-hosted via `@fontsource` with the latin-ext subset: Newsreader for display and headline roles, Plus Jakarta Sans for title, body and label. Material Symbols loaded from Google Fonts.
- Flat surfaces with hairline dividers, visible focus rings, accessible contrast.

### Translation and formatting

- Transloco (`@jsverse/transloco`), runtime, Polish only and active; no picker, no browser detection, no locale in URLs, no language in the user profile.
- One shared scope for common text (Save, Cancel, error codes, shell); each frontend `feature` library owns a lazy-loaded scope next to its code. `ui` components use the `transloco` pipe for shared keys only; feature text reaches them through inputs. Keys follow `<scope>.<area>.<name>`.
- ICU plurals via `@jsverse/transloco-messageformat`; every number in UI text goes through an ICU `plural`, numbers inside messages formatted for `pl-PL`.
- `@jsverse/transloco-locale` configured for `pl-PL`.
- Dates: `dd.MM.yyyy` defined in exactly one place (a single config/token) used by display, the datepicker and parsing; datepicker on `@angular/material-date-fns-adapter` with the `pl` locale. Date-only values travel as `yyyy-MM-dd`.
- Shared formatting utilities for later specs: money from minor units to the `pl-PL` string ("1420,00 zł"), amount parsing accepting a comma or a dot with at most 2 decimals into minor units, and ISBN-13 hyphenation by publisher ranges (`isbn3`). Year, page count, volume and catalogue number are never number-formatted (convention).
- CI runs `transloco-keys-manager` to find keys missing from `pl.json` and unused keys; lint flags hard-coded text in templates.

### Local development

- `docker-compose` runs Postgres and MinIO. One command serves `api` and `web`; Angular's dev-server proxy forwards `/api` to Nest, so the app is same-origin on `http://localhost:4200` and `APP_ORIGIN` is that address.
- Real Google with a separate development OAuth client whose redirect URI is `http://localhost:4200/api/auth/…`; the developer's email is in `SIGNUP_ALLOWLIST`. The API has no test sign-in route, provider switch or bypass.

### E2E stack (modelled on Daylo)

- The `e2e-fullstack` target creates, per run and under a random run id: an isolated Postgres container (tmpfs, run-scoped name and label) and an isolated MinIO container, both removed on cleanup only after their identity (label, run id) is verified; then runs the migrations and the seed; starts a fake OIDC provider on a random loopback port; starts the API from the e2e entrypoint; serves the built frontend; runs Playwright.
- **Fake OIDC provider:** discovery metadata, `authorize` (a page listing the synthetic accounts to click), `token` (RS256 ID token with `iss=https://accounts.google.com`, `aud`, `sub`, `email`, `email_verified`, `nonce`) and JWKS. It validates client id/secret, redirect URI, PKCE S256, `state` and `nonce`; codes are single-use with a short expiry. It is a standalone test utility so the Identity integration tests can start it too.
- **E2E-only API entrypoint:** a separate entrypoint, not part of the normal API bundle, is the only place that swaps the `openid-client` server metadata to the fake provider (issuer still Google) and, from `mvp-catalog` on, wires the fake metadata sources. It refuses to start unless `NODE_ENV=test`, the database is `127.0.0.1/<db>_e2e_<runId>` and the provider is on loopback. Production has no switch, flag or endpoint for this.
- **Synthetic accounts** in the fake provider: `owner`, `contributor`, `viewer`, `invited`, `outsider`. The seed in this spec: `owner` is in the e2e allowlist and seeded as a user; `contributor` and `viewer` are seeded as existing users (matched by `sub`) so later specs can give them Shares; `invited` has no user (its Invitation is seeded by `mvp-sharing`); `outsider` has nothing and is refused. `mvp-catalog` adds the seed collection owned by `owner`; `mvp-sharing` adds the Shares and the Invitation. The seed is organised so each spec adds its own part.
- Tests create their own data as the signed-in actor; a test that changes roles, Shares or Invitations creates its own collection and never mutates seeded ones.
- Playwright fixture `actors.login(account)` signs in through the real browser flow in a fresh browser context.
- `e2e-fullstack:inspect` starts the same stack and waits for manual browsing.
- Chromium only, desktop and mobile emulation.

### CI and repository

- GitHub Actions on pull requests to `main` and pushes to `main`, per-PR concurrency cancelling stale runs.
- Conventions job: commitlint on the PR title and the PR's commits (on `main`, the latest commit).
- Quality job: `nx affected -t lint test build` on PRs, `nx run-many -t lint test build` on `main`; a check that the Drizzle schema has no ungenerated migration; `transloco-keys-manager` check.
- E2E job: affected projects with the `e2e-fullstack` target, Chromium installed in the job, 2 Playwright workers, no sharding (add it when e2e exceeds ~10 minutes); Playwright reports uploaded on failure.
- CI needs no application secrets; the e2e stack generates its own.
- `main` is protected: changes land only through a PR with all checks green. Creating the Git repository, the GitHub remote and the branch protection rule are human setup steps.
- Environments: local development and the ephemeral per-run e2e stack only. No staging, no per-PR previews.

## Testing Decisions

### What makes a good test

- Tests exercise external behaviour through the highest available seam and never assert on internals (private methods, Drizzle queries, which helper was called). A refactor that keeps behaviour must keep tests green.
- Real Postgres (Testcontainers) for everything that persists; fakes only for things outside the process boundary we don't own (Google, later metadata sources and file storage) and for time (fake clock).
- Each test sets up its own data through operations or the seed and asserts on what a caller can observe: returned values, typed errors, HTTP responses, cookies, rows visible through other operations.

### Seams

1. **Identity domain operations** (primary seam): Vitest against a real Postgres, with a fake clock and the fake OIDC provider started on loopback, so `beginSignIn` → `completeSignIn` runs the real `openid-client` exchange. Covers:
   - first sign-in admitted by allowlist (case-insensitive), refused with `auth.inviteOnly` (no user row created), admitted by `isInvited` through a test account-hooks implementation;
   - `email_verified=false` refused;
   - returning user matched by `sub`, profile and email refreshed; email collision keeps the old email;
   - `afterSignIn` called on every successful sign-in;
   - `returnTo` accepted only for relative paths; `state`/`nonce`/PKCE mismatch and replayed codes rejected;
   - sessions: several per user; `resolveSession` rejects unknown, expired and tombstoned; sliding refresh at most once a day (fake clock); sign-out ends only the current session; the expired-session sweep;
   - `deleteAccount`: tombstone fields, sessions gone, hook called inside the transaction (rollback when it throws), unknown email is `NotFound`, re-sign-in creates a new user through the gate;
   - partial unique indexes allow several tombstones.
2. **HTTP adapter** (thin): an in-process Nest app over a real Postgres for cross-cutting web behaviour only: `__Host-session` cookie attributes on callback and its clearing on sign-out, re-issue on sliding refresh, the Origin check (missing/foreign Origin → 403 on state-changing requests), CORS for `APP_ORIGIN` only, `GET /me` 401 vs 200, domain errors and validation failures rendered as `problem+json` with `code`/`params`, `/health` 200 and 503.
3. **Infrastructure units**: the config schema (missing/invalid variables fail with their names), the migration runner under concurrent startup (two runners, one application), the daily job runner (runs at most once a day across restarts, idempotent re-run) with a fake clock.
4. **Frontend**: Vitest unit tests for pure utilities (money formatting and parsing, ISBN hyphenation, date format parsing, `returnTo` handling) and for the theme-mode store (default Systemowy, persistence, blocked storage). No component snapshot tests.
5. **E2E (Playwright, `e2e-fullstack`)**: sign in as `owner` and see the shell with name and email; deep link while signed out returns to it after sign-in; `outsider` sees "Brak dostępu" and its button returns to the sign-in screen; sign-out returns to the sign-in screen and a reload stays signed out; theme switch persists across reload; "O aplikacji" reachable signed out; unknown route shows the 404 screen. Desktop and mobile emulation for the shell.

Account-hooks tests are extended by `mvp-catalog` (owned collections deleted, summary lines) and `mvp-sharing` (Invitation opens the gate and converts on sign-in, Shares deleted).

### Prior art

- The codebase is empty; this spec creates the first tests and their patterns (Testcontainers fixture, fake clock, fake OIDC provider, `actors.login`), which later specs reuse.
- The e2e stack, fake OIDC provider, e2e entrypoint guard and CI workflow follow the user's earlier project Daylo (`apps/web-e2e/environment/`, `apps/api/e2e/main.ts`, `ci.yml`).

## Out of Scope

- Collections, items, creators, genres, shelves, tags, the Collections & Access implementation of the account hooks, the Media module and file storage adapter, the Metadata Lookup module and fake sources, the image sweep and orphan-creator job: `mvp-catalog`.
- Browse and search, the "Wszystko" landing page, the wishlist, sidebar navigation entries and top-bar search: `mvp-browse`.
- Shares, Invitations (gate admission by Invitation, conversion on sign-in), the permission matrix, collection settings and invite dialog: `mvp-sharing`.
- Production deployment: custom domain and DNS, the production Google OAuth client, the deploy job and Render Blueprint, Neon snapshots, backups and rollback, the Render plan choice (map Out of scope; ticket 24).
- Staging and per-PR preview environments; CI sharding.
- Self-service account deletion and any user-facing preview or export before deletion (ticket 25).
- Profile editing and a profile page.
- A language picker, languages other than Polish, browser language detection.
- Token-based API access for the future MCP server, and the MCP server itself.
- Emails of any kind.
- Safari for local development; non-Chromium browsers in e2e.
- Sentry, external uptime monitoring.
- Native mobile apps, offline mode.

## Further Notes

- **Decisions made while writing this spec** (not stated in the map tickets; please confirm):
  - the account-hooks interface owned by Identity, to avoid an Identity ↔ Collections & Access library cycle (ADR-0001 allows direct cross-module calls but Nx forbids cycles);
  - `prompt=select_account` on the Google authorisation request, so a refused person can choose another account (the "Wyloguj" button on "Brak dostępu" has no session to end);
  - a missing `Origin` header on a state-changing request is treated as a mismatch;
  - the variable name `SIGNUP_ALLOWLIST` and the API's `/api` route prefix (taken from the dev callback path in ticket 23).
- Ticket 15 says deleting a collection cascades via foreign keys and that external calls go through a throttled queue; both are superseded (ADR-0003, and Lookup module ticket 22 respectively) and do not apply here.
- No new glossary terms. "Allowlist", "tombstone", "admission gate" and "account hooks" are technical terms, not domain language. No ADR conflicts.
- The hosting target (Render Frankfurt, Cloudflare Pages, Neon Frankfurt, R2 EU) shapes the code now (`__Host-` cookie, `APP_ORIGIN`, migrations at startup with an advisory lock, `/health`, in-process daily jobs tolerant of a sleeping free instance) even though deployment itself is out of scope.

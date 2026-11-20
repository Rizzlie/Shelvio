# 03: Configuration and local infrastructure

**What to build:** A developer copies `.env.example` to `.env`, runs `docker-compose` (Postgres and MinIO) and starts the API; misconfiguration stops the API at once with the variable's name; `GET /health` reports whether the database is reachable; logs are structured JSON. See the spec's "Configuration", "Observability" and "Local development".

**Blocked by:** 01 (Nx workspace with apps and boundary rules).

**Status:** done

- [x] `docker-compose` runs Postgres and MinIO for local development.
- [x] One Zod schema validates environment variables at startup: `NODE_ENV`, `PORT`, `DATABASE_URL`, `APP_ORIGIN`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `SIGNUP_ALLOWLIST` (comma-separated emails, parsed into a lowercased list), `LOG_LEVEL`. Later specs can extend the schema.
- [x] Missing or invalid variables make the API exit before listening, with a message naming each offending variable (unit-tested).
- [x] `.env.example` replaced: every variable above with a comment; `GOOGLE_BOOKS_API_KEY` removed; `DISCOGS_TOKEN` kept documented for `mvp-catalog`. `.env` stays untracked.
- [x] `GET /health` (unauthenticated) returns 200 when the database answers and 503 when it does not (tested against a real and an unreachable Postgres).
- [x] Structured JSON logs at `LOG_LEVEL`; secrets and tokens are never logged.

## Comments

- The `minio/minio` Docker Hub repository is gone (MinIO stopped publishing community images), so `compose.yaml` uses `chainguard/minio`, pinned by digest. The e2e stack (13) should reuse the same image.
- Local Postgres listens on host port 5434 (5432 and 5433 are commonly taken by other local projects); override with `POSTGRES_PORT`.
- `/health` is served under the global prefix as `GET /api/health`.
- The `pg` pool and the Testcontainers helper (`apps/api/src/testing/`) are interim: ticket 04 moves the pool into the `db` library and builds the shared Postgres test fixture.
- Request logs carry the path only; query strings are dropped because the OAuth callback's `code` and `state` arrive there.
- The config failure at startup is printed as plain multi-line text on stderr, not JSON: it happens before the logger exists and is read by a developer or in the host's deploy log.
- Every `/api/health` probe writes an info-level request log line. If the host's polling floods the logs, ignore that route in `autoLogging` (ticket 24 also needs to point the host's health check at `/api/health`).

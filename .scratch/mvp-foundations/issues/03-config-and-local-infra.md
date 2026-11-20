# 03: Configuration and local infrastructure

**What to build:** A developer copies `.env.example` to `.env`, runs `docker-compose` (Postgres and MinIO) and starts the API; misconfiguration stops the API at once with the variable's name; `GET /health` reports whether the database is reachable; logs are structured JSON. See the spec's "Configuration", "Observability" and "Local development".

**Blocked by:** 01 (Nx workspace with apps and boundary rules).

**Status:** ready-for-agent

- [ ] `docker-compose` runs Postgres and MinIO for local development.
- [ ] One Zod schema validates environment variables at startup: `NODE_ENV`, `PORT`, `DATABASE_URL`, `APP_ORIGIN`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `SIGNUP_ALLOWLIST` (comma-separated emails, parsed into a lowercased list), `LOG_LEVEL`. Later specs can extend the schema.
- [ ] Missing or invalid variables make the API exit before listening, with a message naming each offending variable (unit-tested).
- [ ] `.env.example` replaced: every variable above with a comment; `GOOGLE_BOOKS_API_KEY` removed; `DISCOGS_TOKEN` kept documented for `mvp-catalog`. `.env` stays untracked.
- [ ] `GET /health` (unauthenticated) returns 200 when the database answers and 503 when it does not (tested against a real and an unreachable Postgres).
- [ ] Structured JSON logs at `LOG_LEVEL`; secrets and tokens are never logged.

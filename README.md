# Shelvio

Keeping records of books and vinyl records, shared with friends. An Nx monorepo: `apps/web` (Angular) and `apps/api` (NestJS), with libraries under `libs/`.

## Local development

Requirements: the Node version in `.node-version` and Docker.

1. `npm ci`
2. `docker compose up -d` starts Postgres (and MinIO for later features).
3. Copy `.env.example` to `.env` and fill it in (below). The API names every missing or invalid variable at startup.
4. `npm run dev` serves the API and the web app. Open `http://localhost:4200`; the dev server forwards `/api` to the API, so the app and the API share that origin. The API applies the database migrations at startup.

### Signing in with Google

Local development signs in with real Google, through a separate OAuth client for development. The API has no test sign-in route, switch or bypass.

1. In Google Cloud Console, open APIs & Services > Credentials and create an **OAuth client ID** of type **Web application** (configure the consent screen first if asked; "External" in testing mode is enough, with your Google account as a test user).
2. Add `http://localhost:4200/api/auth/google/callback` as an **Authorised redirect URI**. No JavaScript origin is needed.
3. In `.env`, set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from the client, keep `GOOGLE_REDIRECT_URI=http://localhost:4200/api/auth/google/callback`, and put your Google email in `SIGNUP_ALLOWLIST`.
4. Open `http://localhost:4200` and click "Zaloguj przez Google". The first sign-in creates your account. An email outside the allowlist (with no Invitation) sees "Brak dostępu" and no account is created.

The session cookie is `__Host-session`, which needs `Secure`; Chromium and Firefox accept it on `http://localhost`, Safari does not, so use one of those locally.

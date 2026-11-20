# 13: E2E environment

**What to build:** One command starts a fresh, isolated Shelvio stack per run (Postgres and MinIO containers, migrations, seed, fake Google, e2e-only API entrypoint, built frontend), runs Playwright and cleans up; a smoke test sees the sign-in screen. See the spec's "E2E stack (modelled on Daylo)".

**Blocked by:** 12 (Sign-in screens (frontend)).

**Status:** ready-for-agent

- [ ] Playwright e2e project with an `e2e-fullstack` target; Chromium only, with desktop and mobile emulation projects.
- [ ] Per run, under a random run id: a Postgres container (tmpfs, run-scoped name and label) and a MinIO container; both removed on cleanup only after their label and run id are verified, also when the run fails.
- [ ] Migrations, then the seed: users `owner`, `contributor`, `viewer` (matched by `sub`); `owner` in the e2e allowlist; `invited` and `outsider` have no user. The seed is structured so later specs add their own parts.
- [ ] The fake OIDC provider (ticket 09) on a random loopback port with the five synthetic accounts.
- [ ] A separate e2e-only API entrypoint, not part of the normal API bundle, swaps the `openid-client` server metadata to the fake provider (issuer still Google); it refuses to start unless `NODE_ENV=test`, the database is `127.0.0.1/<db>_e2e_<runId>` and the provider is on loopback (refusals unit-tested).
- [ ] The built frontend is served against that API on one origin.
- [ ] Smoke test: opening the app shows the sign-in screen.

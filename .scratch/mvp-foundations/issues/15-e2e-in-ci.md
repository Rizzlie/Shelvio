# 15: E2E in CI

**What to build:** Pull requests run the affected e2e projects in CI and keep the Playwright report when they fail. See the spec's "CI and repository".

**Blocked by:** 02 (CI pipeline), 14 (Sign-in in e2e tests).

**Status:** ready-for-agent

- [ ] An e2e job runs the `e2e-fullstack` target for affected projects on PRs (all on `main`), with Chromium installed in the job.
- [ ] One job, 2 Playwright workers, no sharding (a comment notes adding sharding once e2e takes more than ~10 minutes).
- [ ] Playwright reports are uploaded as artifacts on failure.
- [ ] No application secrets are used; the stack generates its own.
- [ ] A deliberately broken e2e assertion fails the job and uploads the report.

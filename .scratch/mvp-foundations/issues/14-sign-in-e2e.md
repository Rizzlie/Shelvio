# 14: Sign-in in e2e tests

**What to build:** E2E tests sign in as any synthetic account through the real browser flow, the key sign-in scenarios are covered, and a developer can browse the e2e stack by hand. See the spec's "E2E stack" and "Testing Decisions → E2E".

**Blocked by:** 13 (E2E environment).

**Status:** ready-for-agent

- [ ] Playwright fixture `actors.login(account)` gives each actor a fresh browser context and signs in by clicking "Zaloguj przez Google" and choosing the account on the fake provider's page.
- [ ] Scenario: `owner` signs in and sees their name.
- [ ] Scenario: a deep link opened while signed out returns to that page after sign-in.
- [ ] Scenario: `outsider` sees "Brak dostępu" and its button returns to the sign-in screen.
- [ ] Scenario: an unknown route shows the 404 screen.
- [ ] `e2e-fullstack:inspect` starts the same stack, prints the app URL and waits, so the developer can sign in as any synthetic account.

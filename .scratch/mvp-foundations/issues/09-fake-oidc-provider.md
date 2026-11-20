# 09: Fake OIDC provider

**What to build:** A standalone test utility that impersonates Google's OIDC HTTP surface on a loopback port, so Identity integration tests and the e2e stack can run the real `openid-client` flow without Google. See the spec's "E2E stack → Fake OIDC provider".

**Blocked by:** 01 (Nx workspace with apps and boundary rules).

**Status:** ready-for-agent

- [ ] Starts on a random loopback port and stops cleanly; configured with a client id/secret, the allowed redirect URI and a list of synthetic accounts (`sub`, email, `email_verified`, name, avatar).
- [ ] Endpoints: discovery metadata, `authorize` (an HTML page listing the accounts to click), `token`, JWKS.
- [ ] `token` issues an RS256 ID token with `iss=https://accounts.google.com`, `aud`, `sub`, `email`, `email_verified`, `nonce`, name and picture.
- [ ] Validates client id/secret, redirect URI, PKCE S256, `state` and `nonce`; codes are single-use and expire after a short time.
- [ ] Tests: a full code flow with `openid-client` succeeds; a wrong secret, wrong redirect URI, bad PKCE verifier, and replayed or expired code are rejected.
- [ ] Lives in a test-only library that is never part of the API's production bundle.

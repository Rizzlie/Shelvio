# 11: Returning sign-in (backend)

**What to build:** A returning user is recognised by their Google account even if their Google email changed, and their name, email and avatar are refreshed on every sign-in, without the admission gate. See the spec's "Identity module → Operations → completeSignIn".

**Blocked by:** 10 (First sign-in (backend)).

**Status:** done

- [x] A user found by `sub` signs in without the admission gate, even if their email is no longer on the allowlist and they have no Shares.
- [x] Name and avatar URL are refreshed from the ID token on every sign-in.
- [x] The lowercased email is refreshed unless another user already holds it; then the old email is kept, sign-in proceeds and a warning is logged (without tokens).
- [x] `afterSignIn` is called after the refresh.
- [x] Integration tests with the fake OIDC provider cover: changed name/avatar/email refreshed, an email collision keeps the old email and logs a warning, a user removed from the allowlist still signs in.

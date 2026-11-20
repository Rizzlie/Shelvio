# 18: Operator account deletion

**What to build:** The operator deletes a user's account with one CLI command given their email: the command shows a summary, asks for confirmation, then anonymises the user into a tombstone and ends all their sessions; signing in again is a fresh first sign-in. See the spec's "Account deletion (operator only)" and the ADR-0003 amendment.

**Blocked by:** 10 (First sign-in (backend)).

**Status:** ready-for-agent

- [ ] Identity operations `summariseAccount(email)` (id, name, email, session count, plus the account hook's lines) and `deleteAccount(email)`.
- [ ] `deleteAccount` in one transaction: calls the hook `deleteAccountData(userId, tx)`, hard-deletes all the user's sessions, sets `name`, `email`, `avatar_url` and `google_sub` to NULL and sets `deleted_at`, keeping the same id. A throwing hook rolls everything back.
- [ ] An unknown or already deleted email → `NotFound`.
- [ ] Partial unique indexes allow several tombstones.
- [ ] An Nx target on the API (e.g. `delete-account --email=…`) boots the application context without HTTP, prints the summary, asks for interactive confirmation and aborts on anything but yes.
- [ ] Integration tests: tombstone fields, sessions gone, hook called inside the transaction, rollback on hook failure, `NotFound`, and re-sign-in with the same Google account (fake OIDC) going through the admission gate and creating a new user.

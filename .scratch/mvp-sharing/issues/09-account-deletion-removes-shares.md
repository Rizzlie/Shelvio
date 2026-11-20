# 09: Account deletion removes Shares

**What to build:** When the operator deletes an account, the summary also lists, per owned collection, how many people have access and how many Invitations are pending, plus how many Shares the person has in other collections. The deletion removes the person's Shares, and the owned collections' Shares and Invitations go with those collections. Items the person added to other collections stay. See the spec's "Account hooks" (`summariseAccount`, `deleteAccountData`).

**Blocked by:** 05 (Invitations for people without an account).

**Status:** ready-for-agent

- [ ] `summariseAccess(userId)` and `deleteSharesOf(userId, tx)` in Collections & Access.
- [ ] The account-hooks composition extends the `summariseAccount` lines and calls `deleteSharesOf` alongside `hardDeleteOwnedCollections` inside Identity's deletion transaction.
- [ ] Invitations other Owners made for the user's email are left untouched.
- [ ] Extends the foundations and catalog `deleteAccount` tests: the user's Shares elsewhere gone; owned collections' Shares and Invitations gone; items the user added elsewhere kept; summary lines with the counts; rollback when the hook throws; a later Invitation admitting the same Google account as a new user.

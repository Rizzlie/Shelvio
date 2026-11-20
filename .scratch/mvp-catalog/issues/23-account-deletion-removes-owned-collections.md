# 23: Account deletion removes owned collections

**What to build:** When the operator deletes an account, the summary lists the collections the person owns with their item counts, and the deletion hard-deletes those collections (soft-deleted ones included) with everything in them; their files and orphaned creators are left to the daily jobs. See the spec's "Account deletion", the ADR-0003 amendment and the foundations account-hooks decision.

**Blocked by:** 02 (Add an item by hand).

**Status:** ready-for-agent

- [ ] Collections & Access `summariseOwnedCollections(userId)` and `hardDeleteOwnedCollections(userId, tx)`; Catalog provides item counts per collection.
- [ ] The account-hooks implementation wired in the API app replaces the no-op for `summariseAccount` (one line per owned collection, soft-deleted ones marked, with item counts) and `deleteAccountData` (calls `hardDeleteOwnedCollections` inside Identity's transaction); `isInvited` and `afterSignIn` stay no-ops.
- [ ] Items, details, credits, genres, shelves and tags go through the FK cascades; Collections & Access never calls Catalog to delete.
- [ ] Extends the foundations `deleteAccount` tests: owned collections and their contents gone (soft-deleted included), other users' collections untouched, rollback when the hook throws, summary lines.

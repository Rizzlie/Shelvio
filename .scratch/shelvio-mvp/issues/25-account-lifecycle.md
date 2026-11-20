# Account lifecycle

Type: grilling
Status: resolved
Blocked by: none
Map: [Shelvio MVP](../map.md)

## Question

Can a user delete their account in the MVP, and if so what happens to their collections, shares, invitations and personal data?

Known so far:
- [Authentication and sessions](08-authentication.md): an account, once created, stays even if it loses all shares; stored profile is name, email and avatar URL.
- [Data model for item types](07-item-type-data-model.md): items and collections are soft-deleted (ADR-0003); `*_by_user_id` columns reference users.
- Transferring collection ownership is out of scope.

Decide:
- whether account deletion is in the MVP at all (self-service, or by the admin on request),
- what happens to owned collections (and the people they are shared with), to the user's Shares and Invitations, and to `*_by_user_id` references,
- what personal data must be hard-deleted versus kept,
- whether the user can see or export anything first (export is out of scope).

## Answer

**In the MVP, operator-only.** No self-service deletion and no UI. The operator runs a CLI command (an Nx target on the API, e.g. `delete-account --email=…`) that calls an **Identity** domain operation `deleteAccount`. Before acting it prints a summary (owned collections, item count, people with access) and asks for confirmation. A self-service button is out of scope; it can later call the same operation.

**The user row becomes a tombstone.** Same id; `name`, `email`, `avatar_url` and `google_sub` set to NULL; `deleted_at` set. All `*_by_user_id` columns and `invited_by` keep pointing at it (none appear in API responses), so no FK needs `SET NULL`. All the user's sessions are hard-deleted. Unique indexes on `email` and `google_sub` must allow NULLs (or be partial).

**Owned collections are hard-deleted**, soft-deleted ones included, with their items, details rows, credits, shelves, tags, Shares and Invitations, in one transaction. Their images lose their references and the daily sweep removes the files from R2. This is the one exception to soft delete, recorded as an amendment to ADR-0003. People the collections were shared with lose access silently (no notifications, per [Item activity](21-item-activity.md)). Creators are global and untouched.

**Other collections.** The user's Shares are hard-deleted (as when leaving). Items and photos they added as a contributor belong to that collection and stay; their `created_by_user_id`/`updated_by_user_id` point at the tombstone.

**Signing in again** with the same Google account is a first sign-in: the tombstone has no `sub` or email, so the invite-only gate applies as usual (allowlist or Invitation) and a new, empty user is created. Nothing is restored.

**Before deletion** there is no preview or export for the user (export is out of scope); the operator may send them the summary.

Glossary: no new term. ADR-0003 amended.

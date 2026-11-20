# Item activity

Type: grilling
Status: resolved
Blocked by: 07, 10, 20
Map: [Shelvio MVP](../map.md)

## Question

Does the MVP show who added or changed an item in a shared collection, and if so what, where, to whom, and what must be stored for it?

Known so far:
- [Data model for item types](07-item-type-data-model.md) stores `created_at`, `updated_at` on every main table and `created_by_user_id` on `items`; soft delete stores `deleted_by_user_id` (ADR-0003).
- [Invitation flow](09-invitation-flow.md) stores `invited_by` on Shares.
- [UI brief and theme](20-ui-brief-and-theme.md) currently forbids showing "added by / edited by" anywhere, but only to stop the mockup tool from inventing it; it was not a decision.

## Answer

**Nothing about who added, changed or deleted an item is shown anywhere in the MVP UI.** The rule in [UI brief and theme](20-ui-brief-and-theme.md) ("added by / edited by" is never shown) is now a real decision.

**Stored, not shown:**
- `items` gains `updated_by_user_id`, set in the same domain operation that bumps `updated_at`: any edit of fields, move, "Mam to", photo change.
- The existing `created_by_user_id` and `deleted_by_user_id` stay as they are.
- These columns are written by the domain layer only.

**Not exposed:** `created_by_user_id`, `updated_by_user_id` and `deleted_by_user_id` are **not part of any REST API response**. The future MCP server may expose them after the MVP if it needs them.

**Not in the MVP:** item change history, a collection activity feed ("recently added in …") and notifications. Sorting by date added already shows what is new in a collection.

No glossary changes. No ADR: one nullable column, easy to change.

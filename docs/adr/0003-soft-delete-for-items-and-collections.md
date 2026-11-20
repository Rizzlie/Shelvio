# Soft delete for items and collections

Items and collections are never physically deleted in the MVP. Deleting one sets `deleted_at` and `deleted_by_user_id`, and every domain operation (REST, the future MCP server, search, duplicate detection) treats such rows as non-existent. Indexes that serve normal reads are partial (`WHERE deleted_at IS NULL`). Deleting a collection marks only the collection; its items disappear because reads skip items of deleted collections, so restoring a collection later would bring it back exactly as it was. Shelves and tags are hard-deleted (`items.shelf_id` is set to NULL, `item_tags` rows cascade); credits share their item's fate.

The MVP has **no trash view, no restore and no purge**: soft-deleted rows simply stay. The periodic sweep of orphaned files therefore must not delete files that belong to soft-deleted items or collections. This amends the "deleting a collection cascades via foreign keys" note in the Technical foundations ticket: the FK cascade only happens on a future purge.

## Considered options

- **Hard delete with FK cascades**: rejected. An accidental deletion of an item, or of a whole shared collection, would be unrecoverable, and the cost of keeping the rows is negligible at this scale.
- **Soft delete on every table (shelves, tags, credits)**: rejected. It adds filtering everywhere for data that is cheap to recreate.
- **Trash with restore and 30-day purge in the MVP**: deferred until after the MVP. The columns make it possible to add later without migrating data.

## Amendment (2026-11-20): account deletion

Deleting an account (see the Account lifecycle ticket) is the one exception: the user's owned collections are **hard-deleted** with their items, credits, shelves, tags, Shares and Invitations (soft-deleted ones included), and their files become orphans for the daily sweep. Someone who asks to be deleted expects their data gone, which soft delete without purge cannot give. The user row itself is not deleted but anonymised into a tombstone, so `*_by_user_id` and `invited_by` references stay valid.

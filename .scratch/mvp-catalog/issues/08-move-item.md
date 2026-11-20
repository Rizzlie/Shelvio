# 08: Move an item

**What to build:** From the item page the Owner moves an item to another of their collections; the shelf is cleared and tags are matched by name in the target. See the spec's "Catalog: items" (`moveItem`) and the move rules of map ticket 10.

**Blocked by:** 06 (Shelves and tags).

**Status:** ready-for-agent

- [ ] `moveItem(actor, itemId, targetCollectionId)` → `POST /items/{id}/move`; requires `item:edit` in both collections; same collection → `item.moveToSameCollection`; a target the actor cannot see → `NotFound`.
- [ ] Clears the shelf; matches tags by name case-insensitively in the target, creating missing ones; genres, credits, cover, photo, rating, status, priority, purchase details and notes unchanged; files untouched; bumps `updated_*`; refreshes `search_text`.
- [ ] "Przenieś" action and dialog: target list from `listCollectionsWhere(actor, 'item:edit')` without the current collection, the note "Półka zostanie wyczyszczona, tagi zostaną dopasowane po nazwie.", snackbar "Przeniesiono do kolekcji …".
- [ ] Domain tests: shelf cleared, tags matched and created, same-collection refusal, another user's collection refused.
- [ ] E2E: move a tagged item on a shelf between two owned collections and check the result.

# 03: Contributor manages items and organisation

**What to build:** A Contributor works in a shared collection like its Owner, except for collection-level decisions. They add items to it (it is offered and preselected in "Do kolekcji"), edit and delete any item, use "Mam to", manage photos, shelves and tags, see purchase details, move items between any two collections where they are Owner or Contributor, and get duplicate notices from shared collections. Their settings page has "Półki i tagi" (the read-only "Osoby" tab arrives in ticket 07); settings tabs are derived from permissions. See the spec's "Permission matrix", "Frontend: Collection settings" and Testing seams 1 and 4.

**Blocked by:** 01 (Shares and the role matrix).

**Status:** ready-for-agent

- [ ] Catalog operations succeed for a Contributor through the existing `assertCan` calls; `updated_by_user_id` is set to the Contributor; nothing is shown about who changed what.
- [ ] The widening of `listCollectionsWhere(actor, 'item:edit')` verified: Contributor collections in "Do kolekcji", the "Przenieś" targets, the duplicate scope and the `editable` wishlist scope.
- [ ] "Ustawienia kolekcji" tabs come from the collection's `permissions`: Owner "Ogólne" and "Półki i tagi" (plus the tabs of tickets 04 and 05); Contributor "Półki i tagi"; a tab route the actor may not use falls back to the first allowed tab. The browse header shows the settings link for Contributors.
- [ ] Domain tests with a real Contributor Share: create, edit, delete, `markOwned`, photo link and removal, shelf and tag management; move between two Owner/Contributor collections succeeds, move into a Viewer collection → `Forbidden`; rename or delete the collection → `Forbidden`; purchase details present.
- [ ] Frontend unit test: settings tabs from permissions (Owner, Contributor, Viewer → none).
- [ ] E2E: `contributor` on "Dom" adds an item to "Dom" (preselected when coming from it), edits it, uses "Mam to", and manages shelves on a settings page with "Półki i tagi" and no "Ogólne".

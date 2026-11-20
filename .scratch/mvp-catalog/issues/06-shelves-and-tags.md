# 06: Shelves and tags

**What to build:** The Owner manages a collection's shelves and tags in "Ustawienia kolekcji" → "Półki i tagi", puts an item on a shelf and gives it tags in the item form (creating new ones on the spot), and sees both on the item page. See the spec's "Data model" (`shelves`, `tags`, `item_tags`), "Catalog: genres, shelves, tags" and UI brief 3.5 (section 6) and 3.6.

**Blocked by:** 03 (Edit and delete an item).

**Status:** ready-for-agent

- [ ] `shelves` and `tags` tables (trimmed names 1–50 chars, unique per collection on `lower(name)`, FK to `collections` cascading on delete); `items.shelf_id` with `ON DELETE SET NULL`; `item_tags` cascading from both sides.
- [ ] Operations and REST: list with item counts (non-deleted items only), create, rename, delete for shelves and tags, all requiring `organisation:manage`; `shelf.nameTaken` / `tag.nameTaken`; deleting does not bump items' `updated_*`.
- [ ] `createItem`/`updateItem` take `shelfId` and `tagIds`, which must belong to the item's collection (`organisation.otherCollection`).
- [ ] "Półki i tagi" tab: two lists with name, item count, inline "Zmień nazwę", "Usuń" with "Pozycje z tej półki zostaną bez półki." / "Tag zostanie usunięty z N pozycji." (ICU plural), "+ Nowa półka", "+ Nowy tag".
- [ ] Form section Organizacja: Półka select with "Bez półki" and "+ Nowa półka"; Tagi chips with autocomplete and "Utwórz tag „…”"; the shelf preselected from the add page's shelf context.
- [ ] Item page shows "Półka: <name>" and tag chips.
- [ ] The e2e seed gives "Dom" shelves "Salon" and "Sypialnia", tags "prezent", "ulubione", "do-sprzedania", and a few items without images (an owned book, a wanted book with priority, a vinyl record).
- [ ] Domain tests: unique names ignoring case, counts, shelf delete clears `shelf_id`, tag delete removes links, organisation from another collection refused.
- [ ] E2E: create a shelf and a tag in settings, use them on an item, delete the shelf and see the item without a shelf.

# 05: Genres

**What to build:** The Owner classifies an item with any number of genres from its type's fixed list in a searchable multi-select; the item page shows them as chips. See the spec's "Data model" (`genres`, `item_genres`), "Catalog: genres, shelves, tags" and map ticket 06.

**Blocked by:** 03 (Edit and delete an item).

**Status:** ready-for-agent

- [ ] `genres` table seeded by a migration with exactly the 20 vinyl and 28 book genres (slugs, Polish names, sort order) from map ticket 06; `retired` flag; `item_genres`.
- [ ] `GET /genres?itemType=` returns non-retired genres in sort order; items return their genres (retired ones included) as `{ id, slug, name }`.
- [ ] `createItem`/`updateItem` take `genreIds`; a genre of the other type → `item.genreWrongType`; none is allowed.
- [ ] Form section Organizacja → Gatunki: searchable multi-select from the type's list; switching type in the add form clears genres of the other type.
- [ ] Item page "Organizacja i klasyfikacja" shows genre chips.
- [ ] Domain tests: list per type, wrong-type refusal, retired genre hidden from the list but kept on an item.
- [ ] E2E: add an item with two genres and see the chips.

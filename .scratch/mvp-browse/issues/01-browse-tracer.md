# 01: Browse tracer: "Wszystko" and the collection page as the browse screen

**What to build:** After sign-in the user lands on "Wszystko" and sees a cover grid of every item in their collections, newest first, loading 50 at a time as they scroll. Clicking a collection in "Moje kolekcje" opens the same screen with only that collection selected, under the permanent collection header. The temporary collection page from `mvp-catalog` is gone. See the spec's "What this spec replaces and reuses", "Modules", "Browse query" (scope and paging only), "Results contract", "REST endpoints", "Frontend: routes and URL state" (Wszystko and collection presets), "Frontend: screen" (grid card, infinite scroll) and "E2E seed".

**Blocked by:** every ticket in `mvp-catalog` (../../mvp-catalog/issues/); nothing else in this spec.

**Status:** ready-for-agent

- [ ] Collections & Access: `listVisibleCollections(actor)` (own non-deleted collections, Polish-collated, `owner`, `role: owner`, `permissions { editItems, manageOrganisation, manageCollection, seePurchaseDetails }` derived from the existing actions and `canSeePurchaseDetails`), replacing `listCollections`; `resolveCollectionScope(actor, { visible | editable | ids })`, an invisible or deleted ID → `NotFound`.
- [ ] `GET /collections` returns the visible-collections shape; the sidebar still lists `role = owner` under "Moje kolekcje".
- [ ] Catalog: `browseItems(actor, query)` with `scope` (`visible` default, `ids`), sort `addedAt` desc with ties by `id` desc, keyset cursor, 50 per page, `total` on the first page; soft-deleted items and items of deleted collections excluded; `BrowseItem` contract (incl. `primaryCreators` with the main-role rule, `moreCreators`, vinyl year fallback, `purchase` only when visible, no `*_by_user_id`).
- [ ] `GET /browse/items` with `collection` (repeatable) and `cursor`, parsed by a shared Zod contract; `browse.invalidCursor` added with a Polish translation.
- [ ] Signed-in landing route is "Wszystko" (title "Wszystko"); sidebar "Wszystko" entry with active state; the collection route renders the browse screen with that collection (title = name, collection header with role chip and settings link); an unknown or invisible collection shows the 404 screen; after deleting a collection the user lands on "Wszystko".
- [ ] Grid per UI brief 3.1: shared image component with `thumb`, 2:3 / 1:1 areas, title (2 lines), first creator + "i inni", collection name only when more than one collection is shown, type icon + year, consumed check, single "Chcę mieć · <priorytet>" badge; 5–6 columns desktop, 2 mobile; card opens the item page.
- [ ] Infinite scroll with skeleton cards; inline error with "Spróbuj ponownie".
- [ ] Temporary collection page, `listCollectionItems` and `GET /collections/{id}/items` removed; catalog e2e tests that used the list now use the browse screen.
- [ ] E2E seed: second collection "Winyle" (shelf "Jazz") and the browse items listed in the spec's "E2E seed".
- [ ] Domain tests: scope (visible, ids, `NotFound`), deleted items/collections excluded, 50 per page with `total`, keyset stable when items are added between pages, foreign cursor refused, `purchase` present for the Owner, no `*_by_user_id`; `listVisibleCollections` order, role and permissions.
- [ ] Frontend unit tests: first-creator text with "i inni", year choice.
- [ ] E2E: sign in lands on Wszystko with items from both seeded collections; sidebar collection opens its single-collection view; another account opening the collection route sees "Nie znaleziono".

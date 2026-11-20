# 02: Add an item by hand

**What to build:** An Owner presses "Dodaj" (the FAB on mobile), chooses Książka or Winyl in the "Ręcznie" tab of "Dodaj pozycję", fills the basic item form and saves; the item appears on its own page and in the collection's temporary list. See the spec's "Catalog: items", "Data model" (`items`, `book_details`, `vinyl_details`), "Contracts and visibility", "REST endpoints" and "Frontend" ("Dodaj pozycję", item form, item page).

**Blocked by:** 01 (Collections).

**Status:** ready-for-agent

- [ ] Catalog `domain` and `feature` libraries; `items`, `book_details`, `vinyl_details` tables per ADR-0002 and the spec (composite FK `(item_id, item_type)`, enums as text + `CHECK` from shared consts, price/currency both-or-neither, `bn_record_id` instead of a Google Books column, external-ID columns indexed and not unique, `created_by_user_id`, `updated_by_user_id`, soft-delete columns, FK to `collections` cascading on delete). Shelf, cover and photo columns arrive with their tickets.
- [ ] `createItem` inserts the item and its details row in one transaction after `assertCan(actor, collectionId, 'item:edit')`; only type, title and ownership status are required; ISBN normalised (hyphens/spaces stripped, checksum validated, ISBN-10 → ISBN-13; `item.invalidIsbn`); barcode digits only; `search_text` built from the item's own fields.
- [ ] `getItem` with purchase-detail visibility via `canSeePurchaseDetails` (price, date and priority returned whatever the status for those allowed); no `*_by_user_id` in any response; `listCollectionItems` (50 per page, newest first) for the temporary list.
- [ ] Top-bar "Dodaj" and the mobile FAB open "Dodaj pozycję" carrying the context (collection, item type, ownership status, shelf) in query parameters; "Do kolekcji" lists `listCollectionsWhere(actor, 'item:edit')` preselected from context; with no eligible collection "Dodaj" first opens "Nowa kolekcja" and continues with it selected.
- [ ] The page shows only the "Ręcznie" tab for now (Szukaj and Skanuj arrive in tickets 11 and 21).
- [ ] Item form sections Podstawowe (Typ, Tytuł, Podtytuł for books), Szczegóły (all book or vinyl fields per UI brief 3.5; language and country searchable with Polish names; ISBN-10 shows the converted ISBN-13), Status i ocena, Zakup (only for Mam, PLN, comma or dot, date typed or picked; hidden with a "values are kept" note for Chcę mieć), Notatki (0 / 5000); sticky section index and save bar; "Podaj tytuł" and scroll to the first error. Switching type swaps the details fields.
- [ ] After saving, the form resets with type and collection kept and a snackbar "Dodano do kolekcji …" offers "Zobacz".
- [ ] Item page per UI brief 3.3 for these fields: breadcrumb, status and consumed chips, "Dodano dd.MM.yyyy", title, subtitle, rating stars without a number, "Szczegóły wydania" with only filled fields (hyphenated ISBN-13, vinyl format line), "Szczegóły zakupu" with "Prywatne" for owned items, collection with the role chip, notes; mobile layout with one back arrow and a "⋮" menu. A placeholder (type icon and title) stands in for the picture.
- [ ] The temporary collection page lists items (title, type icon) with "load more", each linking to the item page.
- [ ] Pure formatters for the vinyl format line and ISBN normalisation, with unit tests.
- [ ] Domain tests: create per type with details row, required fields, ISBN normalisation and ISBN-10 conversion, invalid ISBN, non-owner → `NotFound`, visibility, no `*_by_user_id` in returned shapes.
- [ ] E2E: `owner` adds a book and a vinyl record by hand and sees each on its page and in the collection list.

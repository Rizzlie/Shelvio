# Browse and search

Type: grilling
Status: resolved
Blocked by: 05, 07
Map: [Shelvio MVP](../map.md)

## Question

How does a user browse and find items in a collection?

Decide:
- list vs. grid views and what each card shows,
- text search: which fields, implementation (Postgres full-text search, trigram, or a simple ILIKE at this scale), handling of Polish diacritics,
- filters (item type, shelf, tag, genre, ownership status, consumed status, rating) and sorting,
- whether the wishlist is a filter of the collection view or its own screen,
- whether there is a cross-collection view of all items a user can see.
- whether there is a creator view (all items by one creator) and sorting by creator sort name.
- From [Permission matrix](10-permission-matrix.md): viewers never see purchase details, so price and purchase date must not be filterable or sortable for them (sorting by a hidden field leaks it).

## Answer

**One browse screen** for everything; no per-collection screen, no creator page, no separate wishlist screen.
- Filter **collection** is multi-select, defaulting to every collection the user can see (owned and shared). Opening a collection is the same screen with that one collection selected. With several collections selected, each card shows its collection name.
- Shelf and tag filters work only when exactly one collection is selected (shelves and tags belong to a collection).
- Sorting and filtering by purchase price or date are offered only when the user sees purchase details in **every** selected collection; otherwise the option is absent, so nothing leaks to viewers.
- **Landing screen** after sign-in: this view across all collections. Side navigation (menu on mobile) lists owned and shared collections and a **Wishlist** shortcut.
- **Wishlist** = the browse screen with `ownershipStatus = wanted`, sorted by priority. Its collection filter defaults to the collections where the user is Owner or Contributor (amended 2026-11-20, see Comments).

**Views**, toggled by one button; the choice is remembered in the browser (per-viewer convenience).
- **Grid** (default): cover thumbnail, title, first creator (+ "and others"), year, item-type icon, wanted badge with priority, consumed mark.
- **List** (compact rows): the same plus shelf, rating, genres and tags; price and purchase date only for those allowed to see purchase details.
- Creator names are plain text, not links. There is no creator filter; find a creator's items through text search.

**Text search**: one box.
- Fields: title, subtitle, all credited creators' names (any role), series, publisher, label, catalogue number, ISBN and barcode. Not notes, not tags.
- The query is split into words; every word must occur as a substring (AND), case- and diacritic-insensitive ("zolc" finds "Żółć").
- Implementation: a generated search-text column, `lower(unaccent(...))`, `ILIKE '%word%'` with a `pg_trgm` index (same technique as creator autocomplete). No Postgres full-text search (no built-in Polish dictionary, not needed at this scale), no fuzzy/typo matching in the MVP.
- A digits-only query (hyphens allowed) is matched exactly against ISBN-13 / barcode; ISBN-10 is converted to ISBN-13 first.
- Search text spans the item and its credits, so it must be refreshed when credits change and when the operator renames or merges a creator ([Creator duplicates and corrections](26-creator-duplicates.md)).

**Filters**: item type, collection, shelf (incl. "no shelf"), tags, genres, ownership status, consumed (yes/no), rating (minimum, e.g. "4+", and "unrated"), priority (wanted items only), and purchase price/date for those allowed. Values within one filter are OR'ed; different filters are AND'ed. Only the total result count is shown, no per-value facet counts. No year/language/format filters in the MVP.

**Sorting**: date added (default, newest first), title, creator (first credit's `sortName`, else `name`), year, rating, priority; purchase price and purchase date for those allowed. Ascending or descending; empty values always last. Title and creator sort use Polish collation (ICU; Neon supports ICU collations; use `pl-x-icu` if present in `pg_collation`, else `CREATE COLLATION pl (provider = icu, locale = 'pl')` in a migration).

**Paging and state**: filtering, sorting and search run on the server; the client loads 50 items at a time with infinite scroll. All state (filters, sort, query, view) lives in URL query parameters, so Back works and filtered views can be linked.

Glossary: no new terms (Wishlist already defined as a view). No ADR: all of this is easy to change.

## Comments

**2026-11-20, amendment from [UI brief and theme](20-ui-brief-and-theme.md).** The Wishlist no longer defaults to every visible collection: by default it shows only collections where the user is Owner or Contributor, because wanted items in a Viewer collection are someone else's wishes and the "Mam to" action is unavailable there. Viewer collections can still be added through the collection filter (e.g. to look for a gift). The general browse screen is unchanged and still defaults to all visible collections.

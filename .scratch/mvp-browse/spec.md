# MVP browse: browse screen, search, filters and the wishlist

Status: ready-for-agent
Spec: 3 of 4 for the Shelvio MVP (after `mvp-foundations` and `mvp-catalog`; followed by `mvp-sharing`, which assumes this one is implemented)
Map: [Shelvio MVP](../shelvio-mvp/map.md)
Builds on: [MVP foundations](../mvp-foundations/spec.md) (app shell and its empty slots, translations and formatting utilities, contracts and `problem+json`, e2e stack) and [MVP catalog](../mvp-catalog/spec.md) (collections, items, creators, genres, shelves, tags, images, `items.search_text`, `markOwned` and the "Mam to!" dialog, the shared image component, the collection header and "Nowa kolekcja" dialog, `listCollectionsWhere` and `canSeePurchaseDetails` in Collections & Access), both assumed fully implemented.
Sources: map tickets [16 Browse and search](../shelvio-mvp/issues/16-browse-and-search.md) (incl. its 2026-11-20 amendment) and [20 UI brief and theme](../shelvio-mvp/issues/20-ui-brief-and-theme.md); [10 Permission matrix](../shelvio-mvp/issues/10-permission-matrix.md) for the purchase-detail rule; ADR-0001 to ADR-0005; [UI README](../shelvio-mvp/ui/README.md), [UI brief](../shelvio-mvp/ui/ui-brief.md) (sections 0, 2, 3.1, 3.2, 3.7), [theme decisions](../shelvio-mvp/ui/theme-decisions.md); mockups `screens/01` to `05`.

## Problem Statement

After `mvp-catalog` a person can record books and vinyl records in their collections, but they can barely find them again. Opening a collection shows a temporary plain list, newest first, with nothing else: no cover grid, no search, no filters, no sorting. There is no way to see everything across several collections at once, the "Wszystko" and "Lista życzeń" entries in the sidebar and the search field in the top bar are empty slots, and after signing in the person lands on an empty shell. Someone with a few hundred records cannot answer simple questions like "do I have anything by Komeda?", "which books haven't I read yet?", "what is on my wishlist, most wanted first?" or "how much have I spent on records?". Typing Polish titles without diacritics ("zolc", "swiat") finds nothing, and wanted items can only be marked as owned one by one from their item pages.

## Solution

One browse screen shows the items of any set of the user's collections:

- After sign-in the user lands on **"Wszystko"**: every collection they can see, in a cover **grid** (default) or a compact **list**, 50 items at a time with infinite scroll.
- Opening a collection from the sidebar is the same screen with that one collection selected; its header shows the collection's name, the user's role and the settings link. A multi-select collection picker next to the title changes which collections are shown.
- The header counts the items in the selected collections ("24 pozycje · 18 Mam · 6 Chcę mieć · 14 Przeczytane / przesłuchane") and shows **"Wartość zakupów"**, the sum of purchase prices in złoty over the collections where the user may see purchase details.
- One **search** field in the top bar finds items by title, subtitle, creators, series, publisher, label, catalogue number, ISBN or barcode, ignoring case and Polish diacritics; a pasted ISBN or barcode matches exactly.
- **Filters** in a side panel (a bottom sheet on mobile) narrow by item type, collection, shelf, tags, genres, ownership status, consumed, minimum rating, priority and purchase price/date; they apply instantly and appear as removable chips. **Sorting** by date added, title, creator, year, rating, priority and purchase price/date, ascending or descending, uses Polish alphabetical order.
- **"Lista życzeń"** is the same screen preset to wanted items, most wanted first, over the collections where the user may edit items; each card has a **"Mam to"** button that records the purchase and removes the item from the list.
- Everything about the view (collections, search, filters, sort, grid or list) lives in the URL, so Back works and a filtered view can be bookmarked.

In this spec every collection is the user's own. The rules that depend on the actor's role (which collections are visible, the wishlist's default collections, where purchase details may be sorted, filtered and summed) are built on Collections & Access permissions, so `mvp-sharing` only widens their answers.

## User Stories

### Landing and navigation

1. As a signed-in user, I want to land on "Wszystko" showing all my collections' items, so that I see my whole collection at once.
2. As a user, I want "Wszystko" and "Lista życzeń" at the top of the sidebar (in the drawer on mobile), so that the two main views are always one click away.
3. As a user, I want the sidebar entry of the view I'm on marked as active ("Wszystko", "Lista życzeń" or the collection), so that I know where I am.
4. As a user, I want clicking a collection in "Moje kolekcje" to open the browse screen with only that collection selected, so that a collection page works the way it always did.
5. As a user following a link to a collection (such as an old bookmark or a link from a friend), I want the browse screen for that collection, so that the collection route keeps working.
6. As a user opening a link to a collection that doesn't exist, was deleted or isn't visible to me, I want the generic "Nie znaleziono" screen, so that nothing is revealed.
7. As a user who deleted a collection, I want to land on "Wszystko", so that I continue from a sensible place.
8. As a new user without any collection, I want "Wszystko" to tell me I have no collection yet and offer "Nowa kolekcja", so that I know the first step.

### Collection picker

9. As a user, I want a multi-select collection picker next to the title showing "Wszystkie kolekcje (N)" when all are selected, so that I see the scope at a glance.
10. As a user, I want to pick any subset of my collections, so that I can look at, say, only my two vinyl collections together.
11. As a user, I want the picker to show a collection's name when exactly one is selected and "N kolekcje" otherwise, with a correct Polish plural, so that the label is always accurate.
12. As a user, I want at least one collection always selected, so that the screen never shows an undefined scope.
13. As a user on a collection's page who selects other collections too, I want to move to "Wszystko" with my filters kept, so that the title stays truthful.
14. As a user, I want the collection filter in the filter panel and the picker to be the same setting, so that they never disagree.

### Header

15. As a user, I want the title "Wszystko", "Lista życzeń" or the collection's own name, with no breadcrumb or eyebrow above it, so that the page is clean (UI brief rule).
16. As a user, I want a counts line "24 pozycje · 18 Mam · 6 Chcę mieć · 14 Przeczytane / przesłuchane" for the selected collections, with correct Polish plurals, so that I know the size and state of what I'm looking at.
17. As a user, I want parts of the counts line that are zero left out (except the total), so that empty values don't clutter the header.
18. As a user, I want "Wartość zakupów" with one amount in złoty ("1420,00 zł"), the sum of the purchase prices of owned items in the selected collections, so that I know what I've spent.
19. As a user, I want "Wartość zakupów" hidden when no included item has a price, so that I don't see a meaningless "0,00 zł".
20. As a user, I want kept purchase values of items switched back to Chcę mieć left out of "Wartość zakupów", so that the total reflects what I own.
21. As a user, I want "Wartość zakupów" computed only over collections where I may see purchase details, with a small note naming the excluded ones, so that the total never leaks prices and I know what it covers.
22. As a user with exactly one collection selected, I want the header to show my role and a settings link to "Ustawienia kolekcji" when I may manage it, so that collection settings stay one click away.
23. As a user, I want the header counts to describe the selected collections rather than the current filters, so that they stay a stable overview while the toolbar shows how many items match.

### Toolbar, view and paging

24. As a user, I want the toolbar to show the number of matching items ("12 pozycji"), so that I see the effect of my search and filters.
25. As a user, I want a grid/list toggle, so that I can switch between covers and details.
26. As a user, I want my grid or list choice remembered in this browser, so that the screen opens the way I like it.
27. As a user opening a link with a view in it, I want that view shown, so that a shared link looks as intended.
28. As a user, I want the first 50 items shown at once and more loaded as I scroll, with skeleton cards while loading, so that big collections stay fast.
29. As a user returning with Back from an item page, I want the list and my scroll position restored, so that I don't lose my place.
30. As a user, I want a clear message with "Spróbuj ponownie" when loading fails, so that a network hiccup doesn't leave me with a broken page.

### Grid

31. As a user, I want a grid of 5–6 columns on desktop and 2 on mobile, so that covers are the hero.
32. As a user, I want book covers in a 2:3 area and vinyl covers in a 1:1 area, centred on a neutral background, so that the grid stays tidy.
33. As a user, I want each card to show the cover, else my photo, else a placeholder with the type icon and title, so that every item is recognisable.
34. As a user, I want the title (at most two lines) and the first creator with "i inni" when there are more, so that I identify the item quickly.
35. As a user looking at several collections, I want each card to show its collection name, so that I know where an item belongs.
36. As a user looking at one collection, I want no collection name on cards, so that cards stay quiet.
37. As a user, I want the type icon and year at the bottom left and a consumed check at the bottom right, so that the key facts sit in fixed places.
38. As a user, I want a wanted item to carry a single badge "Chcę mieć · <priorytet>" on its cover and owned items no badge, so that wanted items stand out.
39. As a user, I want clicking a card to open the item page, so that I can see everything about it.

### List

40. As a user, I want the list to show a thumbnail with the type icon, the title with the series under it, the creators, the year, the shelf, rating stars, the status ("Chcę mieć · priorytet" or empty) and the consumed check, so that I can scan details in rows.
41. As a user looking at several collections, I want a collection column, so that I know where each row belongs.
42. As a user who may see purchase details, I want price and purchase date columns for owned items, so that I can compare what I paid.
43. As a user, I want the list to fit a 1280 px screen without horizontal scrolling, so that I never scroll sideways.
44. As a phone user, I want compact list rows (thumbnail, title, creator, year, status), so that the list is readable on a small screen.
45. As a user, I want rating stars filled up to the value with no number, and screen readers to hear "Ocena: 4 z 5", so that ratings read cleanly and accessibly.
46. As a user, I want empty cells shown as "—" in the list, so that columns stay aligned (UI brief rule).
47. As a user, I want clicking a row to open the item page, so that the list works like the grid.

### Search

48. As a user, I want one search field "Szukaj po tytule, twórcy, ISBN…" in the top bar, so that searching always starts in the same place.
49. As a user, I want the search to look in title, subtitle, every credited creator's name, series, publisher, label, catalogue number, ISBN and barcode, so that I find an item by whatever I remember.
50. As a user, I want my notes and tags not searched, so that results match what the item is, not what I wrote about it.
51. As a user, I want the search to ignore case and Polish diacritics, so that "zolc" finds "Żółć" and "swiat" finds "Dziwny jest ten świat".
52. As a user, I want every word I type to have to match somewhere, in any order, so that "lem solaris" finds Solaris by Lem.
53. As a user, I want parts of words to match, so that "tokarcz" finds Tokarczuk.
54. As a user searching a creator by their sort name ("tokarczuk, olga"), I want their items found, so that both name forms work.
55. As a user pasting an ISBN with or without hyphens, or an old ISBN-10, I want exactly that edition found, so that I can check whether I already have a book.
56. As a user typing a barcode, I want exactly the item with that barcode found, so that I can check a record in a shop.
57. As a user searching a short number like "1984", I want titles containing it found, so that numeric titles still work.
58. As a user, I want results to update as I type, without every keystroke creating a Back step, so that searching feels instant and history stays usable.
59. As a user typing in the top-bar search on the item page or in settings, I want Enter to take me to "Wszystko" with the results, so that search works from anywhere.
60. As a user searching inside one collection or the wishlist, I want the search to stay within that view, so that searching narrows what I'm looking at.
61. As a user, I want the search field to show the current search when I come back to a view, so that I see why the list is narrowed.

### Filters

62. As a user, I want a "Filtry" button opening a side panel (a bottom sheet on mobile), closed by default, so that filters don't take space until I need them.
63. As a user, I want filters applied the moment I change them, with no "apply" button, so that I see the effect at once.
64. As a user, I want a dot on "Filtry" when any filter is active, so that I know the list is narrowed even with the panel closed.
65. As a user, I want to filter by item type (Książka, Winyl), so that I can look at only books or only records.
66. As a user, I want to filter by ownership status (Mam, Chcę mieć), so that I can see only what I own or only what I want.
67. As a user, I want to filter by consumed (tak / nie), with the label "Przeczytane / przesłuchane", so that I can find what I haven't read or listened to yet.
68. As a user, I want to filter by minimum rating ("5", "4+", "3+") or "Bez oceny", so that I can find my favourites or items I haven't rated.
69. As a user, I want to filter by genres, including "Bez gatunku", so that I can find all my jazz or items I haven't classified.
70. As a user with one item type selected, I want only that type's genres offered, and both lists under "Książki" and "Winyle" otherwise, so that the genre list makes sense.
71. As a user, I want to filter wanted items by priority (niski, średni, wysoki), so that I can see what I want most.
72. As a user looking at one collection, I want to filter by shelf, including "Bez półki", and by tags, so that I can see what stands on a shelf or carries a label.
73. As a user looking at several collections, I want shelf and tag filters absent, so that I'm not offered values that belong to only one collection.
74. As a user who may see purchase details in every selected collection, I want to filter by purchase price range (in złoty) and purchase date range, so that I can find what I bought last year or anything over 100 zł.
75. As a user, I want several values within one filter to mean "any of them" and different filters to mean "all of them", so that combining filters behaves predictably.
76. As a user, I want active filters shown as removable chips above the results with "Wyczyść filtry", so that I see and undo them in one click.
77. As a user, I want default values never shown as chips, so that only my own choices appear.
78. As a user, I want no per-value counts in the filter panel, only the total in the toolbar, so that the panel stays quiet (UI brief rule).
79. As a user who narrows to several collections while a shelf or tag filter is set, I want that filter dropped, so that no invisible filter keeps hiding items.

### Sorting

80. As a user, I want to sort by date added (default, newest first), title, creator, year, rating and priority, so that I can order items the way I need.
81. As a user who may see purchase details in every selected collection, I want to sort by purchase price and purchase date too, so that I can see my most expensive or latest purchases.
82. As a user, I want an ascending/descending toggle next to the sort, with a sensible default direction for each sort (titles A–Z, ratings and priorities highest first), so that the first click does what I expect.
83. As a user, I want titles and creators sorted in Polish alphabetical order (Ł after L, Ś after S), so that the order looks right.
84. As a user sorting by creator, I want items ordered by the first author's or artist's sort name ("Tokarczuk, Olga"), so that books sort by surname.
85. As a user, I want items without a value for the sort (no rating, no year, not wanted, no price) always at the end, in either direction, so that blanks never crowd the top.
86. As a user, I want items with the same sort value in a stable order, so that items don't jump around or repeat while scrolling.
87. As a user, I want vinyl records sorted and shown by their pressing year, falling back to the original release year, so that every record has a year where one is known.

### Wishlist

88. As a user, I want "Lista życzeń" to show only wanted items, so that I see what I'm looking for.
89. As a user, I want the wishlist sorted by priority, highest first, by default, so that what I want most is on top.
90. As a user, I want the wishlist to include, by default, only collections where I may edit items, so that other people's wishes in collections I only view don't fill my list.
91. As a user, I want to add other visible collections to the wishlist through the picker, so that I can look for a gift.
92. As a user, I want the wishlist to keep the ownership-status setting fixed (no status filter there), so that it always stays a wishlist.
93. As a user, I want a "Mam to" button on each wanted card in the wishlist that I may edit, so that I record a purchase straight from the list.
94. As a user pressing "Mam to", I want the existing "Mam to!" dialog with thumbnail, title, collection, optional price and optional date (today by default), so that recording a purchase takes seconds.
95. As a user who saved "Mam to!", I want the item to disappear from the wishlist, the counts to update and the snackbar "Przeniesiono do posiadanych", so that the change is confirmed.
96. As a user with an empty wishlist, I want "Twoja lista życzeń jest pusta" with "Dodaj pozycję", which opens the add page with Chcę mieć preselected, so that I can start one.

### Empty states and "Dodaj" context

97. As a user opening an empty collection, I want "Ta kolekcja jest pusta" with "Dodaj pierwszą pozycję", so that the next step is obvious.
98. As a user whose search or filters match nothing, I want "Brak wyników" with "Wyczyść filtry", so that I can get back to all items.
99. As a user with collections but no items anywhere in view, I want a short empty state with "Dodaj pozycję", so that the screen isn't blank.
100. As a user pressing "Dodaj" while looking at one collection I may edit, I want it preselected in "Do kolekcji", so that the item lands where I was.
101. As a user pressing "Dodaj" with a single shelf filter, a single type filter or on the wishlist, I want the shelf, the type or Chcę mieć preselected, so that the add form matches my context.

### State in the URL

102. As a user, I want the collections, search, filters, sort and view in the URL, so that I can bookmark or share a view.
103. As a user, I want Back to undo my last filter, sort or view change, so that browsing feels like navigating.
104. As a user, I want default values left out of the URL, so that links stay short.
105. As a user opening a bookmarked link whose shelf, tag or collection no longer exists, I want that value quietly dropped, so that old links still open.
106. As a user opening a link with options I'm not allowed to use (such as a price sort), I want those dropped instead of an error, so that links shared between people still work.

### Mobile

107. As a phone user, I want the sidebar in a drawer behind a hamburger, "Dodaj" as a floating button, and filters and sort in bottom sheets, so that the screen fits one hand.
108. As a phone user, I want "Wartość zakupów" and the counts above the toolbar in a compact form, so that the overview stays visible.

### Developer and future MCP

109. As a developer, I want one Catalog operation that answers "browse these items with this query" for any actor, so that the REST API and the future MCP server search the same way with the same permission rules.
110. As a developer, I want the visible collections, the wishlist's default collections and purchase-detail availability derived from Collections & Access permissions, so that `mvp-sharing` changes only who gets which answer.
111. As a developer, I want the browse URL state parsed and normalised by pure functions, so that the rules are unit-tested without a browser.
112. As a developer, I want the e2e seed to contain a second collection and items that cover the search, filter and sort cases, so that browse e2e tests start from a known state.

## Implementation Decisions

### What this spec replaces and reuses from `mvp-catalog`

- **Replaced**: the temporary collection page and its plain item list, and the temporary endpoint `GET /collections/{id}/items` with Catalog's `listCollectionItems`. Both are removed; catalog e2e tests that relied on the temporary list are moved to the browse screen.
- **Kept**: the collection route (the one invitation links will use) now renders the browse screen with that collection selected. The permanent **collection header** (name, the user's role, the settings link) becomes the single-collection part of the browse header.
- **Reused**: the shared image component (cover → photo → placeholder, fixed 2:3 or 1:1 area) for grid cards and list thumbnails; the "Mam to!" dialog and `markOwned`; the "Nowa kolekcja" dialog; the "Dodaj pozycję" context query parameters (collection, shelf, ownership status, item type); `items.search_text`, which Catalog already maintains on create, edit, move, credit changes and `creator:rename` / `creator:merge`. This spec only queries it.

### Modules

- **Collections & Access** gains `listVisibleCollections(actor)`: every non-deleted collection the actor may view, Polish-collated by name, each with `id`, `name`, `owner: { id, name }`, the actor's `role` (`owner` here; `contributor` / `viewer` after `mvp-sharing`) and a `permissions` object `{ editItems, manageOrganisation, manageCollection, seePurchaseDetails }` derived from the existing closed action set (`item:edit`, `organisation:manage`, `collection:manage`) and `canSeePurchaseDetails`. In this spec it returns the actor's own collections with every permission true; `mvp-sharing` adds collections reached through Shares with role-specific answers. The existing `listCollections(actor)` is folded into it.
- Collections & Access also gains `resolveCollectionScope(actor, scope)` where `scope` is `{ kind: 'visible' } | { kind: 'editable' } | { kind: 'ids', ids }`: `visible` = all of `listVisibleCollections`; `editable` = `listCollectionsWhere(actor, 'item:edit')` (the wishlist default: Owner and Contributor collections); `ids` = exactly those, each of which must be visible, else `NotFound` (no access → 404, ticket 10). It returns the collection IDs with their purchase-detail visibility.
- **Catalog** gains two read operations (names indicative), the browse seam:
  - `browseItems(actor, query)` → `{ items: BrowseItem[], total?, nextCursor }`.
  - `summariseItems(actor, scope)` → the header counts and "Wartość zakupów".
- Both start from `resolveCollectionScope`; neither touches another module's tables. They are plain domain operations (ADR-0001), so the future MCP server's "find items" tool is a second adapter over `browseItems`.
- **Frontend**: a new `browse` feature library (screen, filter panel, toolbar, cards, list rows, wishlist preset) with its own lazy Transloco scope, a `browse` data-access library (HTTP client and a SignalStore) and pure utilities in a `util` library (URL ↔ query, normalisation, option availability, card text helpers). The shell's empty slots for "Wszystko", "Lista życzeń" and the top-bar search are filled; the signed-in landing route becomes "Wszystko".

### Browse query (domain shape, shared Zod contract)

```ts
// shape of the browse query; names indicative
type BrowseQuery = {
  scope: { kind: 'visible' } | { kind: 'editable' } | { kind: 'ids'; ids: CollectionId[] }; // default visible
  text?: string;                       // trimmed, ≤ 200 chars
  itemTypes?: ItemType[];              // OR
  ownershipStatuses?: OwnershipStatus[];
  consumed?: boolean;
  rating?: { min?: 1 | 2 | 3 | 4 | 5; unrated?: boolean }; // OR'ed when both
  genreIds?: GenreId[]; noGenre?: boolean;                  // OR'ed together
  priorities?: Priority[];             // matches wanted items only
  shelfIds?: ShelfId[]; noShelf?: boolean;                  // exactly one collection in scope
  tagIds?: TagId[];                    // exactly one collection in scope
  purchasePrice?: { minMinor?: number; maxMinor?: number }; // purchase details visible in every collection
  purchaseDate?: { from?: IsoDate; to?: IsoDate };          // idem, inclusive
  sort: { field: 'addedAt' | 'title' | 'creator' | 'year' | 'rating' | 'priority'
                 | 'purchasePrice' | 'purchaseDate'; direction: 'asc' | 'desc' };
  cursor?: string;                     // opaque, from the previous page
};
```

- Values within one filter are OR'ed; different filters are AND'ed; the text search is AND'ed with the filters.
- Only non-deleted items in non-deleted collections are considered (ADR-0003).
- **Shelf and tag filters** require exactly one collection in scope, else `ValidationFailed` `browse.organisationNeedsOneCollection`. IDs not belonging to that collection match nothing.
- **Purchase-detail rule** (ticket 10, UI brief rule 11): sorting by `purchasePrice` / `purchaseDate` and the two purchase filters are allowed only when the actor may see purchase details in **every** collection in scope, else `Forbidden` `browse.purchaseDetailsHidden`. They consider only **owned** items: wanted items' kept purchase values count as empty, so they never match a purchase filter and sort last.
- **Priority** filter and sort consider only **wanted** items; an owned item's kept priority counts as empty.
- A cursor from a different query is `ValidationFailed` `browse.invalidCursor`.

### Text search

- The text is split on whitespace; every word must occur as a substring of `items.search_text` (AND). Each word is normalised with the **same** lower-case + unaccent normalisation Catalog uses to build `search_text` (one shared function, so both sides always agree) and `%`, `_` and `\` are escaped before the `ILIKE '%word%'`.
- **Code mode**: after removing hyphens and spaces, if the text is 8 to 13 digits (a final `X` allowed for ISBN-10), it is matched **exactly** instead of as a substring: a valid ISBN-10 is converted to ISBN-13 and compared with `book_details.isbn13`; any other digit string is compared with `isbn13` and `vinyl_details.barcode`. Shorter digit strings ("1984") and anything with letters use the normal substring search.
- No full-text search, no fuzzy or typo matching, no relevance ranking: the chosen sort applies to search results too.
- A migration adds a GIN `pg_trgm` index on `items.search_text`, partial on `deleted_at IS NULL` (the `pg_trgm` and `unaccent` extensions already exist from creator autocomplete).

### Sorting and paging

- Sort keys:
  - `addedAt`: `items.created_at`; default direction desc.
  - `title`: `items.title` with Polish collation; default asc.
  - `creator`: the first primary credit's `sort_name`, else its `name`, with Polish collation; default asc. The **primary credit** is the lowest-position credit in the type's main role (book `author`, vinyl `artist`), falling back to the lowest-position credit of any role. Computed in the query, so creator renames and merges need no extra maintenance.
  - `year`: book `year`; vinyl `year` (pressing), else `original_year`; default desc.
  - `rating`: default desc. `priority`: high > medium > low, wanted items only; default desc.
  - `purchasePrice`, `purchaseDate`: owned items only; default desc.
- Empty values always sort last, in both directions. Ties are broken by `items.id` descending (UUIDv7, so newest first), which makes the order total.
- **Polish collation**: a migration creates a dedicated ICU collation (`CREATE COLLATION IF NOT EXISTS … (provider = icu, locale = 'pl')`) used by title and creator sorts. Creating our own is deterministic on Neon, local Docker Postgres and Testcontainers, instead of depending on whether `pl-x-icu` happens to exist.
- **Paging**: keyset pagination, 50 items per page. The opaque cursor encodes the query's sort field, direction and the last item's sort value and ID, so new items added while scrolling never cause duplicates or gaps. The first page (no cursor) also returns `total`, the count over the whole query.

### Results contract

- `BrowseItem` (shared Zod): `id`, `itemType`, `title`, `series` and `volumeNumber` (books), `year` (as defined above), `primaryCreators: [{ name }]` (the main-role credits in order, at most 3, plus `moreCreators: boolean`), `collection: { id, name }`, `ownershipStatus`, `priority`, `consumed`, `rating`, `shelf: { id, name } | null`, `cover` and `photo` (each `{ thumbUrl, width, height } | null`), `createdAt`, and `purchase: { price?: Money, date?: IsoDate }` **only** when `canSeePurchaseDetails` holds for the item's collection; the field is absent otherwise, not null, exactly as in Catalog's item contract.
- Genres and tags are not part of `BrowseItem`: the UI brief's list view (the UI source of truth) has no genre or tag columns.
- `*_by_user_id` never appears (ticket 21).

### Summary contract

- `summariseItems(actor, scope)` counts over the collections in scope, **ignoring** text and other filters: `itemCount`, `ownedCount`, `wantedCount`, `consumedCount`.
- `purchaseTotal` (present only when at least one collection in scope allows purchase details and at least one included owned item has a price): `{ amount: Money (PLN), includedCollectionCount, excludedCollections: [{ id, name }] }`. It sums `purchase_price_minor` of **owned** items in the collections where the actor may see purchase details. All amounts are PLN in the MVP (the currency column is always `PLN`; other currencies are a later UI-only change).

### Visible collections and the wishlist default

- The client never decides visibility or defaults by itself: "Wszystko" and the collection picker use `listVisibleCollections`, the wishlist's default is the `editable` scope, and the purchase-detail options come from each collection's `permissions.seePurchaseDetails`. With `mvp-sharing`, Viewer collections appear in "Wszystko" and in the picker but not in the default wishlist, and price options disappear when one is selected, without changes to this spec's code.

### REST endpoints (under `/api`, all authenticated; names indicative)

- `GET /collections` now returns `listVisibleCollections(actor)` (the catalog shape plus `owner`, `role`, `permissions`). The sidebar's "Moje kolekcje" shows `role = owner`; `mvp-sharing` renders the others under "Udostępnione mi".
- `GET /browse/items` with query parameters mirroring `BrowseQuery`: `collection` (repeatable ID) or `scope=editable`, never both; `q`; `type`, `status`, `genre` (repeatable, `none` for "Bez gatunku"), `priority`, `shelf` (repeatable, `none` for "Bez półki"), `tag` (repeatable); `consumed=true|false`; `minRating=1..5`, `unrated=true`; `priceMin`, `priceMax` (minor units); `boughtFrom`, `boughtTo` (`yyyy-MM-dd`); `sort`, `dir`; `cursor`. Parsed by a shared Zod contract into `BrowseQuery`.
- `GET /browse/summary` with `collection` (repeatable) or `scope=editable`.
- New error codes in the shared vocabulary, each with a Polish translation: `browse.organisationNeedsOneCollection`, `browse.purchaseDetailsHidden`, `browse.invalidCursor`.

### Frontend: routes and URL state

- Routes: the signed-in landing route is "Wszystko"; a "Lista życzeń" route; the existing collection route. All three render the same browse screen with a different **preset**:
  - Wszystko: scope = all visible, sort = date added desc, title "Wszystko".
  - Lista życzeń: scope = `editable`, ownership status fixed to wanted (no status filter in the panel, no status chip), sort = priority desc, title "Lista życzeń".
  - Collection: scope = that one collection, title = the collection's name; an unknown or invisible collection shows the 404 screen. Changing the picker to anything else navigates to Wszystko with the other state kept.
- URL query parameters use the same names as the REST endpoint plus `view=list` (grid is the default). **Values equal to the preset's default are omitted**, so links stay short and defaults never show as chips.
- **The URL is the source of truth.** Pure functions turn the URL plus the visible collections (with permissions), the selected collection's shelves and tags, and the genre lists into a normalised browse state, dropping: collections that are no longer visible; shelf and tag values unless exactly one collection is selected, and IDs not in that collection; purchase sorts and filters unless purchase details are visible in every selected collection (the sort falls back to the preset's default); the status filter on the wishlist. When normalisation dropped anything, the URL is rewritten with `replaceUrl`. The same functions decide which sort options and filters the UI offers.
- Every filter, sort, collection or view change pushes a history entry; typing in the search field updates `q` after a short debounce (about 300 ms) and replaces the current entry while the user keeps typing, so Back does not step through letters.
- The view toggle writes `view` to the URL and stores the choice in `localStorage` (wrapped in try/catch; blocked storage means grid). A URL without `view` uses the stored choice.
- The browse store keeps the loaded pages and the scroll position of the last browse URL in memory and restores them when the user comes back with Back; any item mutation made in the app (add, edit, delete, move, "Mam to", photo) clears that memory.

### Frontend: screen

- **Header**: title, collection picker ("Wszystkie kolekcje (N)" when the selection equals all visible collections, the name when one, otherwise an ICU plural "N kolekcje"; at least one must stay selected); counts line from `GET /browse/summary` with ICU plurals, zero parts other than the total hidden; "Wartość zakupów" on the right with the `pl-PL` money formatter and, when `excludedCollections` is non-empty, a small note naming them. With exactly one collection selected: the role chip and the settings link (when `permissions.manageCollection` or `manageOrganisation`); the owner's name only when the actor is not the owner (never in this spec). The "Osoby" link for Viewers comes with `mvp-sharing`.
- **Toolbar**: result count (`total`, ICU plural), sort select with only the allowed options and an asc/desc toggle (switching the sort field resets the direction to that field's default), grid/list toggle, "Filtry" with a dot when any non-default filter is active.
- **Chips row**: one removable chip per active filter value (e.g. "Gatunek: Jazz", "Ocena: 4+"), plus "Wyczyść filtry", which clears every filter and the search text but keeps the collection selection and the preset. The collection selection and the search text are not chips.
- **Filter panel**: desktop right-side overlay, mobile bottom sheet; applied instantly; sections in the UI brief's order: typ, kolekcja, półka (incl. "Bez półki") and tagi (only with one collection), gatunki (incl. "Bez gatunku"; the selected type's list, or both lists under "Książki" / "Winyle"; retired genres not offered), status (not on the wishlist), przeczytane / przesłuchane (tak / nie), ocena minimalna (single choice: "5", "4+", "3+", "Bez oceny"), priorytet, cena zakupu (from/to in zł, parsed with the foundations amount parser) and data zakupu (from/to, foundations date format and datepicker) only where allowed. No per-value counts.
- **Grid card** and **list row** per the UI brief 3.1 and the Solution above, using the shared image component with the `thumb` variant. First creator text: the first primary creator plus "i inni" when `moreCreators` or more than one primary creator. List "Twórcy": primary creators joined by commas. Series line: series name and, if present, "t. <volume>". Year, volume and catalogue number are plain text, never number-formatted. The collection name (card) and column (list) show only when more than one collection is selected. Price and purchase-date columns appear when at least one selected collection allows purchase details; cells are filled only for owned items whose `purchase` is present. The list hides lower-priority columns at narrower widths so that it never scrolls horizontally at 1280 px; on mobile rows show thumbnail, title, first creator, year and status.
- **"Mam to" on wishlist cards**: shown on wanted cards whose collection has `permissions.editItems`; opens Catalog's "Mam to!" dialog; on success the card is removed locally, the summary is reloaded and the snackbar "Przeniesiono do posiadanych" appears (no "Cofnij").
- **Infinite scroll**: an intersection observer requests the next page; skeleton cards while loading; an inline error with "Spróbuj ponownie" on failure.
- **Empty states**: no visible collection at all → "Nie masz jeszcze żadnej kolekcji" with "Nowa kolekcja"; one collection with no items and no filters → "Ta kolekcja jest pusta" with "Dodaj pierwszą pozycję" (when `editItems`); wishlist with no wanted items and no filters → "Twoja lista życzeń jest pusta" with "Dodaj pozycję"; several collections with no items and no filters → "Brak pozycji" with "Dodaj pozycję"; otherwise no matches → "Brak wyników" with "Wyczyść filtry". "Zaproś osoby" in the empty collection state comes with `mvp-sharing`.
- **"Dodaj" context**: the top-bar button, the FAB and the empty-state buttons pass the browse context to "Dodaj pozycję": the collection when exactly one editable collection is selected, the shelf when exactly one shelf value is set, the item type when exactly one type is set, and Chcę mieć on the wishlist or when the status filter is exactly Chcę mieć.
- **Top-bar search**: on a browse route it shows and edits `q` of the current view; elsewhere it starts empty and Enter navigates to Wszystko with `q`.
- **Sidebar**: "Wszystko" and "Lista życzeń" entries with active state; "Moje kolekcje" (from catalog) highlights the open collection.
- Closed vocabulary and hard rules of the UI brief apply: no invented fields or captions, no "added by", at most one badge on a cover, stars without numbers, ICU plurals for every count, PLN only.

### E2E seed

- The seed adds to `owner`'s data: a second collection "Winyle" (shelf "Jazz") and items in both collections covering the browse cases, without images except where noted: titles with Polish diacritics ("Dziwny jest ten świat", "Księgi Jakubowe"), a book with a translator credit, a book in a series with a volume, a book with an ISBN-13 and a vinyl record with a barcode, owned items with and without prices and purchase dates, wanted items with each priority, consumed and not consumed, rated and unrated, with and without genres, on a shelf and on none, with tags. The catalog seed's "Dom" items are reused and extended as needed. Tests that change data create their own collection; the paging test creates 60 items through the REST API in its own collection.

## Testing Decisions

### What makes a good test

- Tests exercise external behaviour through the highest available seam and never assert on internals (the SQL generated, which helper ran, store internals). A refactor that keeps behaviour keeps tests green.
- Real Postgres (Testcontainers) for everything that queries data, including the ICU collation, `unaccent` and the trigram index; a fake clock where dates matter.
- Each test arranges its own data through Catalog and Collections & Access operations and asserts only on what a caller observes: returned items and their order, totals, summaries, typed errors with their codes.

### Seams (agreed with the user)

1. **Domain operations** (primary seam): `browseItems`, `summariseItems`, `listVisibleCollections` and `resolveCollectionScope`, Vitest against real Postgres, prior art the catalog domain tests. Covers:
   - scope: all visible by default, `editable`, explicit IDs, an invisible or deleted collection → `NotFound`, soft-deleted items and items of deleted collections never returned or counted;
   - text search: diacritic- and case-insensitive substring ("zolc" → "Żółć"), every word required in any order, matches through creator name and sort name, subtitle, series, publisher, label and catalogue number, notes and tags not matched, `%` and `_` treated literally, a creator rename refreshing results (through Catalog's existing maintenance);
   - code mode: hyphenated ISBN-13, ISBN-10 converted, barcode exact, a partial code not matching by substring, "1984" searched as text;
   - each filter alone and combined, OR within and AND across, "Bez półki", "Bez gatunku", "Bez oceny" OR'ed with a minimum rating, priority matching wanted items only, purchase filters matching owned items only with inclusive bounds, shelf/tag with several collections → `browse.organisationNeedsOneCollection`, shelf or tag IDs of another collection matching nothing;
   - sorting: every field in both directions, Polish collation (Ł after L, Ś after S), creator sort by the primary credit's sort name with fallbacks, vinyl year fallback, empty values last in both directions, kept priority and kept purchase values on the "wrong" status treated as empty, ties by ID;
   - paging: 50 per page, `total` on the first page, keyset cursor stable when items are added between pages, no duplicates or gaps across pages, foreign cursor → `browse.invalidCursor`;
   - purchase rule: price sort and filters allowed when purchase details are visible in every collection; a test double for `canSeePurchaseDetails` is not used (no fakes of our own modules), so the refusal path `browse.purchaseDetailsHidden` is covered by `mvp-sharing` with a real Viewer; here the tests assert that `purchase` is present for the Owner and that results never carry `*_by_user_id`;
   - summary: counts per status and consumed over the scope ignoring filters, purchase total over owned items only, kept values on wanted items excluded, total absent when no included item has a price;
   - `listVisibleCollections`: own collections only, Polish-collated, role `owner`, all permissions true.
2. **HTTP adapter** (thin, in-process Nest over real Postgres, foundations prior art): `GET /browse/items` parameter parsing (repeatable parameters, `none` values, `collection` together with `scope` refused, out-of-range values) and the new error codes rendered as `problem+json` with `code`/`params`.
3. **Frontend unit tests** (Vitest, pure code): URL ↔ browse state (defaults omitted per preset, round trip), normalisation (invisible collections, shelf/tag dropped with several collections or unknown IDs, purchase options dropped when not visible everywhere, status fixed on the wishlist, sort fallback), option availability, picker label, which counts-line parts show, chip list from state, first-creator text with "i inni", series line, year choice, "Dodaj" context from state, view preference with blocked storage. No component snapshot tests.
4. **E2E (Playwright, `e2e-fullstack`)**, desktop and mobile emulation where layout differs:
   - sign in lands on Wszystko with both seeded collections, counts line and "Wartość zakupów";
   - sidebar collection opens the single-collection view with header, role and settings link; picker to several collections moves to Wszystko and shows collection names on cards;
   - top-bar search "swiat" finds "Dziwny jest ten świat"; a hyphenated ISBN finds its book; search from the item page with Enter;
   - filters: type, status, genre, shelf (one collection), minimum rating, purchase price; chips, removing a chip, "Wyczyść filtry", "Brak wyników";
   - sort by title in Polish order and by creator; direction toggle;
   - list view: columns, toggle remembered after reload; Back undoes a filter change and returns from an item page to the same list;
   - wishlist: wanted only, priority order, "Mam to" removes the card and shows "Przeniesiono do posiadanych";
   - paging: 60 items load as the user scrolls;
   - a bookmarked URL with a deleted shelf opens without it; another account opening the collection route sees "Nie znaleziono";
   - mobile: drawer navigation, filter bottom sheet, FAB with the collection preselected.

### Prior art

- `mvp-catalog`'s domain-operation tests (Testcontainers fixture, data arranged through operations), its thin HTTP adapter tests and e2e tests with the seeded "Dom" collection; foundations' `actors.login`, seed organisation per spec and frontend pure-utility tests (money and date parsing, theme store with blocked storage).

## Out of Scope

- **`mvp-sharing`**: Shares, Invitations and the Contributor and Viewer roles, and therefore: collections reached through Shares in `listVisibleCollections`, "Udostępnione mi" with role chips, Viewer collections outside the default wishlist, purchase details stripped for Viewers and the price options and totals disappearing for them (including e2e tests of `browse.purchaseDetailsHidden` and the "Wartość zakupów" exclusion note with real data), the owner's name in the header of a shared collection, the "Osoby" link and dialog, "Zaproś osoby" in the empty collection state.
- Creator pages, creator filters and clickable creator names (ticket 16).
- Year, language, format, country or decade filters; per-value facet counts; saved searches.
- Fuzzy or typo-tolerant search, relevance ranking, full-text search, searching notes or tags.
- Bulk selection and bulk actions; statistics or charts beyond the header counts and "Wartość zakupów".
- Genres and tags as list columns (not in the UI brief).
- Currencies other than PLN.
- Trash and restore (ADR-0003), history and activity (ticket 21).
- The MCP server (it will reuse `browseItems`).

## Further Notes

- **Decisions made while writing this spec** (not stated in the map tickets; please confirm):
  - Header counts and "Wartość zakupów" summarise the selected collections and ignore the text search and other filters; the toolbar's result count follows the full query.
  - "Wartość zakupów" counts owned items only, excludes kept values on wanted items, and is hidden when no included item has a price; zero parts of the counts line are hidden.
  - Purchase filters and sorts consider owned items only; priority filters and sorts consider wanted items only (kept values count as empty).
  - Code mode only for 8–13 digit strings, so short numeric titles like "1984" stay searchable (ticket 16 says "a digits-only query", which would break them).
  - A dedicated ICU collation is always created by migration rather than preferring `pl-x-icu` when present (ticket 16), for one deterministic name in every environment.
  - The wishlist's default is a domain-level `editable` scope (`item:edit`), not computed in the client, so the future MCP server gets the same default.
  - Unusable values in a URL (invisible collections, unknown shelves or tags, price options the user may not use) are dropped by the client; the API still refuses them with typed errors.
  - "Mam to" appears on wishlist grid cards only (the UI brief says "on the card"); list rows open the item page, which has the button.
  - The wishlist has no status filter; "Wyczyść filtry" clears filters and the search text but keeps the collection selection.
  - Grid/list choice lives in both the URL and `localStorage` (ticket 16 asks for both); the URL wins.
  - The primary creator is the first credit in the type's main role (author / artist), so a translator never becomes the "first creator" or triggers "i inni"; vinyl year falls back to the original year.
  - The owner's name in the single-collection header is shown only for collections the actor does not own.
  - Empty states not in the UI brief: "Nie masz jeszcze żadnej kolekcji" with "Nowa kolekcja", and "Brak pozycji" with "Dodaj pozycję" for several empty collections (new copy; please confirm the wording).
  - Back from an item page restores the loaded pages and scroll position from memory.
- Ticket 16 lists genres and tags as list-view columns; the later UI brief (the UI source of truth) does not, so they are left out. The mockups' EUR amounts and "Zastosuj filtry"/"Zresetuj" buttons are ignored (PLN only, instant filters, "Wyczyść filtry").
- No new glossary terms. "Visible collections" and "scope" are technical terms. The glossary's **Wishlist** has been sharpened to the wanted items in the collections a user owns or contributes to, matching the amendment to ticket 16. No ADR conflicts; nothing here is hard to reverse.

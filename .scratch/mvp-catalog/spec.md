# MVP catalog: collections, items, lookups and images

Status: ready-for-agent
Spec: 2 of 4 for the Shelvio MVP (after `mvp-foundations`; followed by `mvp-browse` and `mvp-sharing`, which assume this one is implemented)
Map: [Shelvio MVP](../shelvio-mvp/map.md)
Builds on: [MVP foundations](../mvp-foundations/spec.md) (workspace, DB and migrations, contracts and `problem+json`, auth and sessions, app shell, translations and formatting utilities, e2e environment, periodic jobs), assumed fully implemented.
Sources: map tickets [01 Book metadata API](../shelvio-mvp/issues/01-book-metadata-api.md), [02 Vinyl metadata API](../shelvio-mvp/issues/02-vinyl-metadata-api.md), [03 Browser barcode scanning](../shelvio-mvp/issues/03-browser-barcode-scanning.md), [05 Item fields per item type](../shelvio-mvp/issues/05-item-fields-per-type.md), [06 Genre lists and mapping](../shelvio-mvp/issues/06-genre-lists.md), [07 Data model for item types](../shelvio-mvp/issues/07-item-type-data-model.md), [11 Covers, photos and thumbnails](../shelvio-mvp/issues/11-covers-photos-thumbnails.md), [12 Barcode scan prototype](../shelvio-mvp/issues/12-barcode-scan-prototype.md), [13 Add-item flow](../shelvio-mvp/issues/13-add-item-flow.md), [18 Polish book coverage](../shelvio-mvp/issues/18-polish-book-coverage.md), [19 Third-party data licensing and attribution](../shelvio-mvp/issues/19-third-party-data-licensing.md), [21 Item activity](../shelvio-mvp/issues/21-item-activity.md), [22 Lookup module](../shelvio-mvp/issues/22-lookup-module.md), [26 Creator duplicates and corrections](../shelvio-mvp/issues/26-creator-duplicates.md); research in [`research/`](../shelvio-mvp/research/); ADR-0001 to ADR-0005; [UI README](../shelvio-mvp/ui/README.md), [UI brief](../shelvio-mvp/ui/ui-brief.md) (sections 3.3 to 3.7), [theme decisions](../shelvio-mvp/ui/theme-decisions.md). Moving an item also uses the move rules of map ticket [10 Permission matrix](../shelvio-mvp/issues/10-permission-matrix.md), restricted here to the Owner.

## Problem Statement

After `mvp-foundations` a person can sign in to Shelvio, but there is nothing to do there: they cannot create a collection, record a book or a vinyl record, or look anything up. Typing every book and record by hand would be slow and error-prone, yet metadata sources are patchy for Polish books (Open Library alone found 6 of 20 Polish ISBNs), a single vinyl barcode matches many pressings, and each source has its own licence rules about what may be stored and how it must be credited. Covers from sources are often missing, so people need to add their own photo of the copy they hold. Creators are shared across all users, so careless creation would fill everyone's autocomplete with duplicates and typos.

The operator needs a way to fix a misspelled or duplicated creator without touching the database, and deleting an account must now also remove the collections that person owns.

## Solution

A signed-in person can keep their own collections of books and vinyl records:

- They create collections, rename and delete them, and manage each collection's shelves and tags in "Ustawienia kolekcji" (tabs "Ogólne" and "Półki i tagi").
- They add items on one "Dodaj pozycję" page with three tabs: **Szukaj** (one input for ISBN, EAN, title, artist or catalogue number, against the Polish National Library, e-ISBN and Open Library for books and Discogs with a MusicBrainz fallback for vinyl), **Skanuj** (the phone camera reads a barcode; the code decides book or vinyl) and **Ręcznie** (an empty form). A chosen candidate fills a short preview (shelf, Mam / Chcę mieć, suggested genres) that is saved with one click, or opens the full item form prefilled.
- Lookups are one-time prefills (ADR-0004): only permitted fields are copied, the cover is copied into Shelvio's own storage once (books from e-ISBN or Open Library, vinyl from Cover Art Archive), and the item is from then on the user's own record.
- A soft notice warns when the same ISBN or release is already in one of their collections, without blocking the save.
- Each item has its own page with the cover and an optional photo, creators with roles, edition details, organisation, notes and a "Źródła" line linking to the metadata sources it came from. From there the Owner edits, moves to another of their collections, deletes, and marks a wanted item as owned with "Mam to".
- Creators are matched rather than duplicated when items are saved, autocomplete finds them by name or sort name ignoring diacritics, and the operator has `creator:rename` and `creator:merge` commands. Creators no longer credited anywhere disappear after a day.
- Covers and photos are served as public WebP thumbnails from R2 (MinIO locally) behind unguessable keys (ADR-0005), and files nobody references are swept daily.
- Until `mvp-browse` replaces it, opening a collection shows a temporary plain list of its items.

In this spec every collection has exactly one person with access: its Owner. Shares, Invitations and the Contributor and Viewer roles come with `mvp-sharing`, which extends the access checks built here.

## User Stories

### Collections

1. As a signed-in user, I want to create a collection with just a name from "+ Nowa" in the sidebar, so that I can start recording items straight away.
2. As a user who just created a collection, I want to land on that empty collection, so that I can add its first item.
3. As a user, I want my collections listed under "Moje kolekcje" in the sidebar (in the drawer on mobile), so that I can open any of them in one click.
4. As a user with several collections, I want them listed in Polish alphabetical order, so that I find them quickly.
5. As an Owner, I want to rename a collection in "Ustawienia kolekcji" → "Ogólne", so that the name stays accurate.
6. As an Owner, I want to delete a collection only after typing its name, so that I cannot delete one by accident.
7. As an Owner deleting a collection, I want to be told that the collection and all its items will disappear for everyone with access, so that I understand the consequence.
8. As an Owner who deleted a collection, I want it and its items to vanish from everywhere, including duplicate notices and move targets, so that it behaves as gone.
9. As an Owner, I want a deleted collection to be kept in the database rather than erased, so that it could be restored after the MVP if I deleted it by mistake.
10. As a user opening a collection that doesn't exist, was deleted or isn't mine, I want the generic "Nie znaleziono" screen, so that nothing about other people's collections is revealed.
11. As a user who opens a collection (until the browse screen exists), I want to see its name, a settings link, a "Dodaj" button and a plain list of its items, newest first, each linking to the item page, so that I can reach everything I added.
12. As a user opening an empty collection, I want "Ta kolekcja jest pusta" with "Dodaj pierwszą pozycję", so that the next step is obvious.

### Shelves and tags

13. As an Owner, I want to see a collection's shelves and tags in "Półki i tagi", each with the number of items on it, so that I know how they are used.
14. As an Owner, I want to create, rename inline and delete shelves, so that I can group items the way they stand at home.
15. As an Owner deleting a shelf, I want to be told "Pozycje z tej półki zostaną bez półki.", so that I know the items stay.
16. As an Owner, I want to create, rename and delete tags, so that I can label items freely.
17. As an Owner deleting a tag, I want to be told how many items lose it ("Tag zostanie usunięty z N pozycji."), so that I can judge the impact.
18. As an Owner, I want shelf and tag names to be unique within a collection regardless of letter case, so that I don't end up with "Salon" and "salon".
19. As an Owner filling in an item, I want to create a new shelf with "+ Nowa półka" and a new tag with "Utwórz tag „…”" without leaving the form, so that organising doesn't interrupt adding.
20. As an Owner, I want an item to stand on at most one shelf and carry any number of tags, so that the model matches how shelves and labels work.

### Adding: the page

21. As an Owner, I want one "Dodaj pozycję" page reached from the top-bar "Dodaj" button (the FAB on mobile), so that adding always starts in the same place.
22. As an Owner, I want a "Do kolekcji" select preselected from where I came from, listing only collections I may add to, so that the item lands in the right collection.
23. As a user with no collection yet who clicks "Dodaj", I want to be asked to create a collection first, so that the item has somewhere to go.
24. As a desktop user, I want the page to open on Szukaj, so that I can type straight away.
25. As a phone user, I want the page to open on Skanuj the first time and then on the tab I used last on this device, so that my habit is respected.
26. As a user opening "Dodaj pozycję" from a view filtered to vinyl, I want Szukaj with Winyl preselected, so that I don't switch it myself.

### Adding: Szukaj

27. As a user, I want a Książka / Winyl toggle and one input "ISBN, EAN, tytuł lub wykonawca", so that I don't have to choose a search field.
28. As a user, I want the search to run on Enter or the "Szukaj" button, not on every keystroke, so that I don't burn the search limit while typing.
29. As a user typing an ISBN with hyphens or spaces, or an old ISBN-10, I want it understood, so that I can copy it from anywhere.
30. As a user typing an ISBN with a wrong check digit, I want to be told it is invalid before anything is searched, so that I can fix a typo.
31. As a user searching a Polish ISBN, I want the Polish National Library tried first, then e-ISBN, then Open Library, so that Polish books are found.
32. As a user searching a foreign ISBN, I want Open Library tried first, then the Polish National Library, so that foreign books are found too.
33. As a user searching a book by title or author, I want results from the Polish National Library and Open Library in one list, Polish library results and Polish editions first and duplicates of the same ISBN collapsed, so that the likely edition is near the top.
34. As a user whose ISBN matches two printings, I want both offered, so that I can pick the one I hold.
35. As a user searching vinyl by barcode, I want only vinyl pressings with exactly that barcode, so that CDs and false matches don't appear.
36. As a user searching vinyl by artist, title or catalogue number, I want vinyl pressings only, so that unwrapped records without a barcode can be found.
37. As a user, I want pressings ordered by how many Discogs users have them, at most 25, so that the common pressing is near the top.
38. As a user, I want each candidate row to show the cover, title, creator, year and a small source label, so that I can tell candidates apart.
39. As a vinyl collector, I want vinyl rows to also show label and catalogue number, country and format, so that I can tell pressings apart.
40. As a user, I want candidates to appear as soon as their data arrives and covers to fill in afterwards, so that a slow cover never delays the list.
41. As a user, I want to see "Data provided by Discogs." linked to the release page next to Discogs candidates, so that Shelvio credits Discogs as required.
42. As a user, I want "Znaleziono N wyników" with a correct Polish plural, so that the count reads naturally.
43. As a user whose search found nothing, I want "Nie znaleźliśmy tej pozycji" with "Dodaj ręcznie" (type and code kept), so that I can still record the item.
44. As a user whose search failed because every source was unavailable, I want "Wyszukiwanie jest chwilowo niedostępne" with "Spróbuj ponownie" and "Dodaj ręcznie", never "not found", so that I don't conclude the item doesn't exist.
45. As a user, I want a failing or rate-limited source to be skipped while the others still answer, so that one outage doesn't break lookups.
46. As a user searching too often, I want "Zbyt wiele wyszukiwań, spróbuj za chwilę", so that I understand why the search was refused.
47. As a user, I want the whole search to answer within about 12 seconds even when a source hangs, so that the page never seems frozen.

### Adding: preview and save

48. As a user who selected a candidate, I want a preview with its cover, title, creators with roles and key fields, so that I can confirm it is the right one.
49. As a user, I want the preview to offer a "Półka" select (with "Bez półki" and "+ Nowa półka") and a Mam / Chcę mieć toggle, so that the most common choices are made without the full form.
50. As a user, I want Mam preselected, or Chcę mieć when I came from the wishlist, and the shelf preselected from the shelf I was looking at, so that defaults match my context.
51. As a user, I want genres suggested from the source shown as "sugerowany" chips I can remove, and confirmed by "Zapisz", so that classification costs no extra step.
52. As a user, I want "Edytuj szczegóły" to open the full form prefilled with the candidate, so that I can correct or complete it before saving.
53. As a phone user, I want the preview on its own screen, so that it is readable.
54. As a user saving a candidate, I want the cover copied with the item when a permitted source has one, so that the item looks right later even if the source changes.
55. As a user saving before the cover appeared in the preview, I want the cover still copied on save, so that I don't have to wait for it.
56. As a user whose cover could not be copied, I want the item saved anyway without a cover, so that a slow cover server never loses my item.
57. As a user who saved from Szukaj, I want to stay on "Dodaj pozycję" with the search cleared, type and collection kept, and a snackbar "Dodano do kolekcji …" with "Zobacz", so that I can add the next item at once.
58. As a user, I want the source's data copied into my item once and never refreshed, so that my edits are never overwritten.
59. As a user adding a Discogs pressing, I want its notes never copied into my notes, so that my notes are mine.

### Adding: Skanuj

60. As a phone user, I want a camera viewfinder with an aiming frame and the hint "Nakieruj aparat na kod kreskowy", so that I know what to do.
61. As a user, I want a torch toggle when my device supports it, so that I can scan in a dim room.
62. As a user, I want a code accepted only after its check digit is valid and it was read the same on two frames, so that misreads don't trigger wrong lookups.
63. As a user scanning a book (EAN starting 978 or 979, except 9790), I want the book lookup to run, and any other code to run the vinyl lookup, so that I never choose the type.
64. As a user whose scan matched one item, I want a "Rozpoznano" card with the code, the summary and "Wybierz tę pozycję", so that I confirm in one tap.
65. As a user whose scan matched several items, I want the candidate list, so that I can pick the right one.
66. As a user whose scan matched nothing, I want only "Nie znaleźliśmy tej pozycji" with "Możesz dodać ją ręcznie", "Dodaj ręcznie" (type and code filled) and "Skanuj ponownie", so that I can continue either way.
67. As a vinyl collector whose records have no barcode, I want a prominent "Brak kodu? Wyszukaj" that opens Szukaj with Winyl set, so that I reach the main vinyl path at once.
68. As a user whose camera can't focus or isn't available, I want to take a still photo of the code instead, so that scanning still works.
69. As a user who saved after a scan, I want a snackbar "Dodano do kolekcji …" with "Skanuj następny", so that I can scan a stack of books quickly.
70. As a user who refused camera access, I want to be told the camera is unavailable and offered Szukaj, so that I'm not stuck.

### Adding: Ręcznie and the item form

71. As a user, I want to choose Książka or Winyl and fill an empty form, so that items no source knows can still be recorded.
72. As a user, I want one scrolling form with a sticky section index on desktop and a sticky "Anuluj" / "Zapisz" bar, so that long forms stay navigable.
73. As a user, I want only the item type, title and ownership status required, so that I can record an item with what I know.
74. As a user leaving the title empty, I want "Podaj tytuł" and Zapisz to scroll to the first error, so that I can fix it.
75. As a user, I want to add creators with an autocomplete that ignores case and diacritics and matches both the name and the sort name, so that typing "tokarczuk, olga" finds "Olga Tokarczuk".
76. As a user, I want the autocomplete's last option to be "Utwórz „…”", with an editable "Nazwa do sortowania" suggested as "Nazwisko, Imię" for book authors or without a leading "The" for artists, so that new creators sort well.
77. As a user, I want a role per credit (autor or tłumacz for books, wykonawca for vinyl) and to reorder credits by dragging, so that the item credits people in the printed order.
78. As a user, I want a creator to appear at most once per item, so that credits stay clean.
79. As a user, I want existing creators to show no editable fields, so that I can't rename someone on every other user's items.
80. As a user who linked the wrong creator, I want to remove the credit and choose or create another, so that I can fix my item myself.
81. As a book owner, I want fields for subtitle, publisher, year, language, page count, series and volume, binding and ISBN, so that I can describe the edition.
82. As a book owner typing an ISBN-10, I want to see the converted ISBN-13, so that I know what is stored.
83. As a vinyl collector, I want fields for label, catalogue number, country, pressing year, original year, disc count, size, speed, release kind, reissue, format notes and barcode, so that I can describe the pressing.
84. As a user, I want language and country as searchable lists with Polish names, so that I pick them quickly.
85. As a user, I want to set Mam or Chcę mieć, a priority for wanted items, a 1–5 star rating with "Wyczyść", and "Przeczytana" or "Przesłuchany", so that the item's status is complete.
86. As an owner of an item, I want to enter the purchase price in złoty (comma or dot, at most 2 decimals) and the purchase date (typed as 14.05.2022 or picked), so that I know what I paid.
87. As a user switching an item to Chcę mieć, I want the purchase section hidden with a note that the values are kept, so that switching back doesn't lose them.
88. As a user, I want to pick genres from the type's fixed list with search, any number or none, so that items are classified consistently.
89. As a user, I want retired genres hidden from the picker but kept on items that have them, so that the list can evolve without losing data.
90. As a user, I want notes of up to 5000 characters with a counter, so that I know how much room I have.
91. As a user switching the type in the add form, I want the details fields swapped, so that I see the right fields.
92. As a user leaving the form with unsaved changes, I want "Odrzucić zmiany?" with "Zostań" and "Odrzuć", so that I don't lose work by accident.
93. As a user who saved from Ręcznie, I want the form reset with type and collection kept and a snackbar with "Zobacz", so that I can add the next one.
94. As a user entering an ISBN in the full form, I want the duplicate notice there too, so that I'm warned even when adding by hand.

### Duplicates

95. As a user, I want a soft amber notice "Masz już tę pozycję w kolekcji …" with "Zobacz" when the same ISBN-13 or the same Discogs or MusicBrainz release is already in one of my collections, so that I don't record a copy twice by mistake.
96. As a user, I want the notice to read "Ta pozycja jest na liście życzeń w kolekcji …" when the match is a wanted item, so that I can go and mark it owned instead.
97. As a user who really has two copies, I want saving still allowed, so that the warning never blocks me.
98. As a user, I want titles and vinyl barcodes ignored by the duplicate check, so that different editions and represses aren't flagged.

### Item page

99. As a user, I want each item on its own page with a breadcrumb "<collection> / <title>", so that I know where it belongs.
100. As a user, I want the cover and then my photo in large size, so that I can see the item clearly.
101. As a user, I want the status chip ("Mam" or "Chcę mieć · priorytet"), the consumed chip and "Dodano 14.05.2022", so that the item's state is visible at a glance.
102. As a user, I want title, subtitle and filled rating stars without a number, so that the page reads cleanly.
103. As a user, I want creators listed as "Name · rola", so that I see who did what.
104. As a user, I want "Szczegóły wydania" with only the filled fields, a hyphenated ISBN-13 and a single vinyl format line such as "1 × 12″, 33⅓ RPM, album, reedycja, 180 g, gatefold", so that empty fields don't clutter the page.
105. As an Owner, I want a "Szczegóły zakupu" card labelled "Prywatne" with price and date for owned items, so that I see what I paid.
106. As a user, I want "Organizacja i klasyfikacja" with the collection and my role, the shelf, genre chips and tag chips, so that I see how the item is organised.
107. As a user, I want notes shown as plain text, so that what I wrote reads as written.
108. As a user, I want a quiet "Źródła" line linking to each metadata source the item has an ID for (Biblioteka Narodowa, Open Library, "Dane z Discogs", MusicBrainz), and none for items entered by hand, so that sources are credited and I can check the original.
109. As a user, I want nothing shown about who added or changed the item, so that the page stays about the item.
110. As a phone user, I want the cover on top, one back arrow and actions in a "⋮" menu, so that the page fits a small screen.

### Editing, moving, deleting, "Mam to"

111. As an Owner, I want "Edytuj" to open "Edytuj pozycję" with every field prefilled, so that I can change anything.
112. As an Owner, I want the item form never to change the collection, so that moving stays a deliberate action.
113. As an Owner, I want "Przenieś" to move an item to another of my collections, so that I can reorganise.
114. As an Owner moving an item, I want to be told "Półka zostanie wyczyszczona, tagi zostaną dopasowane po nazwie.", so that I know what changes.
115. As an Owner who moved an item, I want its tags matched by name in the target collection and missing ones created, and everything else (genres, credits, cover, photo, rating, status, purchase details, notes) unchanged, so that nothing is lost.
116. As an Owner, I want a snackbar "Przeniesiono do kolekcji …" after moving, so that I know it worked.
117. As an Owner, I want "Usuń" to ask "Usunąć „<tytuł>”? Tej operacji nie można cofnąć." before deleting, so that I don't delete by accident.
118. As an Owner who deleted an item, I want to return to its collection, so that I can carry on.
119. As an Owner of a wanted item, I want a "Mam to" button that opens "Mam to!" with the thumbnail, title, collection, optional price, optional date (today by default), "Anuluj" and "Zapisz", so that I record a purchase in seconds.
120. As an Owner who saved "Mam to!", I want the item set to Mam and the snackbar "Przeniesiono do posiadanych", so that the change is confirmed.
121. As a user, I want no "Cofnij" in snackbars, so that confirmations are simple (UI brief rule).

### Covers and photos

122. As a user, I want to add one photo of my copy by drag-and-drop or "Wybierz plik", or on a phone "Zrób zdjęcie / wybierz z galerii", so that items without a cover still look like themselves.
123. As a user, I want the hint "JPEG, PNG lub WebP, do 10 MB", and a clear message when a file is too large, of another type or too big in pixels, so that I know what's accepted.
124. As a user, I want large phone photos shrunk in the browser before upload, so that uploads are quick on mobile data.
125. As a user, I want to upload a photo in the add form before the item exists, so that I can add everything in one go.
126. As a user, I want "Zmień" and "Usuń" on my photo, so that I can replace or remove it.
127. As a user, I want location and camera data removed from my photos and the orientation corrected, so that a shared photo reveals nothing about where I live.
128. As a user, I want the source cover read-only, so that the record of the edition stays faithful (MVP rule).
129. As a user, I want everywhere outside the item page to show the cover, else my photo, else a placeholder with the type icon and title, so that every item has a recognisable picture.
130. As a user, I want images to load fast from a CDN, so that pages with many items stay quick.

### Creators (operator and housekeeping)

131. As a user, I want creators matched when I save a candidate, by source ID first and then by exact name ignoring case and diacritics, so that the same author isn't created twice.
132. As a user, I want two different people with the same name kept apart when their source IDs differ, so that their items don't get mixed.
133. As a user, I want names from the Polish National Library such as "Tokarczuk, Olga" stored as "Olga Tokarczuk" with sort name "Tokarczuk, Olga", so that names read naturally and sort by surname.
134. As a user, I want band names with commas such as "Earth, Wind & Fire" left untouched, so that they are not flipped.
135. As the operator, I want `creator:rename` to change a creator's name or sort name after showing a summary and asking for confirmation, so that I can fix a typo reported by a user.
136. As the operator, I want `creator:merge` to fold a duplicate into a surviving creator, repointing credits and combining source IDs, after a summary and confirmation, so that duplicates disappear.
137. As the operator, I want a merge refused when both creators have different IDs from the same source, so that I don't merge two real people.
138. As a user, I want creators that no item credits any more removed after a day, so that abandoned typos don't pollute everyone's autocomplete.

### Account deletion (operator)

139. As the operator deleting an account, I want the summary to list the collections the person owns with their item counts, so that I see what will be lost.
140. As a person whose account was deleted, I want my collections hard-deleted with all their items, shelves and tags, deleted ones included, and their files cleaned up, so that my data is really gone.

### Developer

141. As a developer, I want metadata sources behind one adapter interface with fake implementations, so that tests and e2e never call live services.
142. As a developer, I want `LOOKUP_SOURCES=fake` locally, so that I can work offline or without a Discogs token.
143. As a developer without a Discogs token, I want the API to start anyway with Discogs reported as failed and MusicBrainz taking over, so that a missing secret doesn't block local work.
144. As a developer, I want a manual `lookup:smoke` command against the live sources, so that I can check parsing still matches reality without putting live calls in CI.
145. As a developer, I want file storage behind one adapter with S3 (R2/MinIO) and in-memory implementations, so that tests need no object store.
146. As a developer, I want the e2e stack seeded with a collection owned by `owner` and fake metadata sources, so that catalog e2e tests start from a known state.
147. As a developer, I want the scanner's code source swappable in an e2e-only build, so that the scan flow is tested without a camera and production has no such hook.

## Implementation Decisions

### Modules

Four backend modules are created, each as a `domain` + `feature` library pair following the foundations conventions (ADR-0001):

- **Collections & Access**: collections and the access question "may this actor do this in this collection?". In this spec the only person with access is the Owner. Public interface (names indicative): `createCollection`, `renameCollection`, `deleteCollection`, `getCollection`, `listCollections(actor)`, `assertCan(actor, collectionId, action)`, `listCollectionsWhere(actor, action)` (for add targets, move targets and duplicate scope), `canSeePurchaseDetails(actor, collectionId)`, and for the operator `summariseOwnedCollections(userId)` and `hardDeleteOwnedCollections(userId, tx)`. Actions are a closed set (`collection:view`, `collection:manage`, `item:edit`, `organisation:manage`, …) so `mvp-sharing` only changes the answers per role. No access → `NotFound`; access with too weak a role → `Forbidden` (only reachable after `mvp-sharing`).
- **Catalog**: items with their details, credits, creators, genres, shelves, tags; duplicate detection; creator matching, operator creator commands and the orphan-creator job. Calls Collections & Access for every permission check and Media for images, and calls Metadata Lookup only to resolve a candidate reference on save.
- **Metadata Lookup**: lookups, the metadata-source adapters, routing and chains, genre suggestion mapping, throttling, cache, per-user limit.
- **Media**: images (covers and photos), variants, the file-storage adapter and the orphan-image sweep.

Dependency direction: Catalog → Collections & Access, Media, Metadata Lookup; Collections & Access → Identity. No cycles. The account-hooks implementation (Identity's interface from foundations) moves from the no-op to a composition in the API app that calls Collections & Access and Catalog (see "Account deletion").

Seams with two adapters (ADR-0001): **file storage** (S3, in-memory), **metadata sources** (real, fake), plus the existing **clock**. Persistence stays inside each `domain` library.

### Data model

All tables in the single `db` library and migration stream; UUIDv7 primary keys; `created_at`/`updated_at` on main tables; enums as `text` + `CHECK` generated from the shared Zod consts (`item_type`, `ownership_status`, `priority`, `binding`, `size`, `speed`, `release_kind`, credit `role`, image `kind`).

- **`collections`**: `id`, `owner_user_id`, `name` (trimmed, 1–80 chars, not unique), `created_at`, `updated_at`, `deleted_at`, `deleted_by_user_id`. Normal-read indexes partial on `deleted_at IS NULL`.
- **`items`** (ADR-0002): `id`, `collection_id`, `item_type`, `title` (1–500 chars), `ownership_status`, `priority`, `rating` (1–5), `consumed` (boolean, default false), `purchase_date` (date), `purchase_price_minor` (≥ 0), `purchase_currency` (always `PLN` from the UI; `CHECK` both-or-neither with the price), `notes` (≤ 5000), `shelf_id` (FK `ON DELETE SET NULL`), `cover_image_id`, `photo_image_id` (unique where not NULL), `search_text`, `created_at`, `updated_at`, `created_by_user_id`, `updated_by_user_id`, `deleted_at`, `deleted_by_user_id`. `UNIQUE (id, item_type)`. No `CHECK`s tied to ownership status.
- **`book_details`**: `item_id` (PK, composite FK `(item_id, item_type)`, `item_type` fixed by `CHECK`), `subtitle`, `publisher`, `year`, `language` (ISO 639-1), `page_count`, `series`, `volume_number` (short text, shown as typed), `binding`, `isbn13` (`char(13)`, digits `CHECK`), `openlibrary_edition_id`, `openlibrary_work_id`, `bn_record_id`. There is **no** `google_books_volume_id` (replaced by `bn_record_id`, ticket 13). External-ID columns indexed, never unique.
- **`vinyl_details`**: same key pattern; `label`, `catalogue_number`, `country` (ISO 3166-1 alpha-2), `year`, `original_year`, `disc_count`, `size` (`12`, `10`, `7`), `speed` (`33`, `45`, `78`), `release_kind` (album, ep, single, compilation), `reissue` (boolean), `format_notes`, `barcode` (digits), `discogs_release_id`, `discogs_master_id`, `musicbrainz_release_id`, `musicbrainz_release_group_id`.
- **`creators`**: `id`, `name`, `sort_name` (nullable), a search column over `lower(unaccent(...))` of `name` and `sort_name` with a trigram index, `openlibrary_author_key`, `discogs_artist_id`, `musicbrainz_artist_id` (each partial `UNIQUE` where not NULL), `created_at`, `updated_at`. No soft delete.
- **`item_credits`**: `item_id`, `creator_id`, `role`, `position`; PK `(item_id, creator_id)`, `UNIQUE (item_id, role, position)`; cascades with the item. Valid roles per type checked by the domain: book → author, translator; vinyl → artist.
- **`genres`**: `id`, `slug`, `item_type`, `name_pl`, `sort_order`, `retired`; seeded by a migration with exactly the 20 vinyl and 28 book genres (slugs and Polish names) from ticket 06; changed only by migrations (merge = repoint `item_genres`; retire = flag). **`item_genres`** `(item_id, genre_id)`; the domain refuses a genre of another item type.
- **`shelves`** and **`tags`**: `id`, `collection_id`, `name` (trimmed, 1–50 chars), timestamps; unique per collection on `lower(name)`. **`item_tags`** `(item_id, tag_id)`, cascading from both sides. Shelves and tags are hard-deleted (ADR-0003).
- **`images`**: `id`, `kind` (`cover` | `photo`), the object keys of the `thumb` and `large` variants, their width and height, `created_by_user_id`, `created_at`.
- **Foreign keys from `items`, `shelves` and `tags` to `collections` cascade on delete.** Normal deletion never hard-deletes (ADR-0003); the cascade serves account deletion (ADR-0003 amendment) and a future purge.
- `items.search_text` is a lowercased, unaccented concatenation of title, subtitle, series, publisher, label, catalogue number, ISBN-13, barcode and every credited creator's name and sort name. Catalog maintains it on create, edit, move and credit changes, and on `creator:rename` / `creator:merge` (soft-deleted items included). Nothing queries it until `mvp-browse` adds search and its trigram index.

### Contracts and visibility

- The item contract is a discriminated union on `itemType`: common fields, a nested `book` or `vinyl` object, `credits: [{ creator: { id, name, sortName }, role, position }]`, `genres: [{ id, slug, name }]`, `shelf`, `tags`, `cover` and `photo` (each `{ thumbUrl, largeUrl, width, height }` or null), `collection: { id, name }`, `createdAt`, `updatedAt`, and `externalIds` grouped per source for the "Źródła" line.
- `created_by_user_id`, `updated_by_user_id` and `deleted_by_user_id` never appear in any response (ticket 21).
- Purchase details are included only when `canSeePurchaseDetails(actor, collectionId)` is true; the field is absent otherwise, not null (always true for the Owner here; `mvp-sharing` makes it false for Viewers). For an actor who may see them, the read contract carries price, date and priority whatever the ownership status, so the edit form can bring back kept values; the UI shows the purchase card and section only for owned items and the priority only for wanted items.
- Money travels as `{ amountMinor, currency }`; dates as `yyyy-MM-dd`.
- Image URLs are `IMAGE_BASE_URL` + object key.
- New error codes in the shared vocabulary (each with a Polish translation): e.g. `item.invalidIsbn`, `item.roleNotAllowed`, `item.creatorCreditedTwice`, `item.genreWrongType`, `item.notWanted`, `item.moveToSameCollection`, `organisation.otherCollection`, `shelf.nameTaken`, `tag.nameTaken`, `image.tooLarge`, `image.unsupportedType`, `image.tooManyPixels`, `image.notLinkable`, `lookup.invalidIsbn`, `lookup.tooManySearches`.

### REST endpoints (under `/api`, all authenticated; names indicative)

- Collections: `GET /collections` (mine, Polish-collated by name), `POST /collections`, `GET /collections/{id}`, `PATCH /collections/{id}` (rename), `DELETE /collections/{id}` (soft).
- Shelves and tags: `GET /collections/{id}/shelves` and `/tags` (with item counts, non-deleted items only), `POST` on the same paths, `PATCH /shelves/{id}`, `DELETE /shelves/{id}`, `PATCH /tags/{id}`, `DELETE /tags/{id}`.
- Items: `POST /collections/{id}/items` (create), `GET /items/{id}`, `PUT /items/{id}` (full replacement of editable fields; the collection and item type cannot change), `DELETE /items/{id}` (soft), `POST /items/{id}/mark-owned`, `POST /items/{id}/move`, `PUT /items/{id}/photo` (`{ imageId }`), `DELETE /items/{id}/photo`.
- Temporary collection list: `GET /collections/{id}/items?cursor=` → 50 per page, newest first, each with id, type, title, first creator and the thumbnail. `mvp-browse` replaces it with its search endpoint.
- Duplicates: `GET /duplicates?isbn13=…` or `?discogsReleaseId=…` / `?musicbrainzReleaseId=…` (optionally `excludeItemId`) → `[{ itemId, title, collection: { id, name }, ownershipStatus }]`.
- Creators: `GET /creators?query=…` → at most 10 by name or sort name, case- and diacritic-insensitive substring match, prefix matches first.
- Genres: `GET /genres?itemType=…` → non-retired genres in sort order (retired ones still come back on items that carry them).
- Media: `POST /images/photos` (multipart, one file) → `{ imageId, thumbUrl, largeUrl, width, height }`.
- Lookups (ticket 22): `POST /lookups/search`, `GET /lookups/candidates/{ref}`, `GET /lookups/candidates/{ref}/cover`.

### Collections & Access behaviour

- `createCollection(actor, { name })` makes the actor the Owner. `renameCollection`, `deleteCollection` require `collection:manage` (Owner). Deleting sets `deleted_at`/`deleted_by_user_id` only; items disappear because every read skips items of deleted collections.
- Every Catalog operation starts with `assertCan`. A soft-deleted collection or item is `NotFound`.
- `listCollectionsWhere(actor, 'item:edit')` returns the Owner's collections here; `mvp-sharing` adds Contributor collections, which automatically widens the "Do kolekcji" select, the move targets and the duplicate scope.

### Catalog: items

- `createItem(actor, collectionId, input)` in one transaction: inserts `items` and the matching details row (ADR-0002), resolves credits (see "Creators"), links genres, shelf and tags (all must belong to the same collection, else `organisation.otherCollection`), links an uploaded photo, sets `created_by_user_id` and `updated_by_user_id`, and builds `search_text`. Input: the common fields, the nested type fields, `credits: [{ creatorId } | { newCreator: { name, sortName? } } | { candidateCreator: { name, sortName?, sourceKey } }, role]` in order, `genreIds`, `shelfId`, `tagIds`, `photoImageId?`, `fromCandidate?: ref`.
- ISBN input is normalised (strip hyphens and spaces, validate the checksum, convert ISBN-10 to ISBN-13); an invalid one is `item.invalidIsbn`. The barcode is digits only.
- `fromCandidate` (ticket 22): the ref (`source:sourceId`) always yields the source's own ID column (`bn_record_id`, `openlibrary_edition_id`, `discogs_release_id`, `musicbrainz_release_id`). Additional IDs (Open Library work, Discogs master, MusicBrainz release group, creators' source IDs) and the cover come from the full candidate, read from the lookup cache or re-fetched; if that fails, the item is still saved with what the client sent and the ref's own ID. Field values are never rebuilt from the cache and image URLs are never accepted from the client.
- **Cover on save**: before the insert transaction, Catalog asks Metadata Lookup for the cover URL of the ref and Media to store it (fetch once, ~10 s timeout, no retry, variants made). Any failure means no cover; the save never fails because of the cover. Book covers come from e-ISBN, else Open Library; vinyl covers from Cover Art Archive; Discogs images are never stored.
- `updateItem(actor, itemId, input)` replaces all editable fields, credits, genres, shelf and tags; the item type and collection are fixed. Bumps `updated_at`/`updated_by_user_id` and refreshes `search_text`. Changing the ISBN in an edit does not touch the cover.
- `deleteItem` soft-deletes (`deleted_at`, `deleted_by_user_id`); credits, genres, tags and image links stay with the row.
- `markOwned(actor, itemId, { purchasePrice?, purchaseDate? })`: only for a wanted item (else `item.notWanted`); sets owned, writes the given purchase values (the dialog's date defaults to today), keeps the priority stored, bumps `updated_*`.
- `moveItem(actor, itemId, targetCollectionId)` requires `item:edit` in both collections (Owner of both here; `mvp-sharing` allows Contributors); same collection → `item.moveToSameCollection`. Clears the shelf; matches tags by name case-insensitively in the target and creates missing ones; everything else, including cover and photo files, is unchanged; bumps `updated_*`.
- `setPhoto(actor, itemId, imageId)` / `removePhoto`: linking needs `item:edit`, a `photo` image created by the actor and not linked to another item, else `image.notLinkable`. Replacing or removing only unlinks the old image (the sweep removes it). Bumps `updated_*`.
- `getItem(actor, itemId)` applies purchase-detail visibility. `listCollectionItems` serves the temporary collection page.
- **Duplicates** `findDuplicates(actor, { isbn13 | discogsReleaseId | musicbrainzReleaseId }, excludeItemId?)` searches non-deleted items in non-deleted collections from `listCollectionsWhere(actor, 'item:edit')`. Books match on ISBN-13; vinyl on Discogs or MusicBrainz release ID; never on title or vinyl barcode. The UI shows one notice: an owned match first ("Masz już tę pozycję w kolekcji …"), else a wanted match ("Ta pozycja jest na liście życzeń w kolekcji …"), each with "Zobacz" to that item.

### Catalog: creators

- Names are normalised on every save: Unicode NFC, trimmed, whitespace runs collapsed. "Surname, Name" inversion is applied only to names from the Polish National Library adapter (which also strips MARC dates and trailing punctuation), never to typed text.
- **Explicit choices**: `{ creatorId }` links an existing creator; `{ newCreator }` (the form's "Utwórz „…”") always creates a new creator with the given sort name.
- **Candidate creators** are matched on save: by source ID (Open Library author key, Discogs artist ID, MusicBrainz artist ID) when the candidate supplies one; else by exact normalised name, case- and diacritic-insensitive, against `name` or `sort_name` (the oldest match wins when several do). A name match is rejected when both sides have an ID from the same source and they differ; then a new creator is created. A name match on a creator lacking that source's ID adds the ID. No match → a new creator, silently, with the candidate's sort name if any.
- Users cannot rename or edit creators.
- Operator commands, as Nx targets on the API in the style of `delete-account`: `creator:rename <id>` (new `name` and/or `sort_name` as options) and `creator:merge <survivor> <merged>`. Each boots the application context without HTTP, prints a summary (names, IDs, source IDs, number of credited items) and asks for confirmation before calling the Catalog operation.
- `mergeCreators` in one transaction: repoints credits to the survivor; where an item credits both, keeps the survivor's credit, drops the other and renumbers positions within that item's roles without gaps; copies source IDs the survivor lacks; refuses (`Conflict`) when both have different IDs from the same source; hard-deletes the merged creator; refreshes `search_text` on every affected item including soft-deleted ones; does not touch `updated_at`/`updated_by_user_id`.
- `renameCreator` updates the names and refreshes `search_text` of credited items the same way.
- **Orphan-creator job** (registered with the foundations daily job runner): deletes creators with no credits at all (credits on soft-deleted items count) created more than 24 h ago.

### Catalog: genres, shelves, tags

- Genre suggestions arrive with the full candidate as Shelvio slugs; the form preselects them as "sugerowany". An item may be saved with any number of genres, including none.
- Shelf and tag operations require `organisation:manage`; names unique per collection ignoring case (`shelf.nameTaken`, `tag.nameTaken`). Deleting a shelf sets `shelf_id` to NULL on its items; deleting a tag removes its `item_tags` rows. Neither bumps the items' `updated_*`.

### Metadata Lookup

As decided in ticket 22, summarised with the details needed to build it:

- **Operations** (authentication only, no collection permission): `searchCandidates({ itemType?, code | query })` → `{ candidates: summary[], sources: [{ source, status: 'hit' | 'miss' | 'failed' | 'skipped' }] }` in one synchronous response; `getCandidate(ref)` → full candidate; `findCover(ref)` → `{ url } | null`. The UI shows "not found" when there are no hits and some source said `miss`, and the "unavailable" state when there are no hits and none said `miss`.
- **Candidate contract** (shared Zod): `ref` (opaque `source:sourceId`), `source`, `detail: 'summary' | 'full'`, common fields, per-type fields nested like the item contract, external IDs, creators (`name`, `sortName?`, `role`, `sourceKey?`), and for full candidates `suggestedGenres` (Shelvio slugs) and, for Discogs, the release page URL and live image URL for the picker. Source genre names stay inside the module (they are mapped to slugs before leaving it, and unmatched values are logged only).
- **Routing** (orchestrator):
  - Book code: normalise and validate the ISBN (`lookup.invalidIsbn` on a bad checksum); `978-83…` / `83…` → BN → e-ISBN → Open Library; other ISBNs → Open Library → BN. Stop at the first source with a hit; all its records are candidates (e.g. two BN printings); fields from different sources are never merged.
  - Book text: BN and Open Library in parallel; one list, BN first and Polish editions first within it, candidates sharing an ISBN collapsed; at most 20 per source, no paging.
  - Vinyl: 12–13 digits → Discogs barcode search (`type=release&format=Vinyl`) with an exact digit match on our side; any other text → Discogs `q`, vinyl releases only; sorted by community "have", at most 25, no master grouping. MusicBrainz only when Discogs returns nothing or fails.
  - Scan (no `itemType`): EAN-13 starting 978, or 979 but not 9790 → book chain; any other EAN/UPC → vinyl chain.
  - In Szukaj with Winyl, digits-only input is a barcode; with Książka, digits-only input (hyphens, spaces and a final X allowed) is an ISBN; anything else is text.
- **Adapters** (`MetadataSource`: `searchByCode`, `searchByText`, `getCandidate`, `findCover`), one per source: BN (`data.bn.org.pl`, parse MARC, not the concatenated flat fields: 245 title/subtitle/volume, 100/700 with `$e` roles mapped to author/translator and other roles dropped, 260/264 publisher and year with forms such as "copyright 2014.", 300 first number as pages, 041 or 008 language converted to ISO 639-1, 490 series and volume, 655/380 genre terms as hints, 009 as `bn_record_id`); e-ISBN (ONIX 3.0, factual fields only, never `TextContent`, `ImprintName` preferred over the legal publisher name, cover link from `SupportingResource`); Open Library (search returns author names in one call; edition and work IDs; cover by cover ID, not by ISBN); Discogs (token in `Authorization`, CC0 fields plus country only, never `notes`; format descriptions mapped to disc count, size, speed, release kind, reissue, with the remainder such as "180 Gram" or "Gatefold" in format notes; country names mapped to ISO codes; original year from the master when present); MusicBrainz (release search and lookup by MBID, re-fetched by ID before use); Cover Art Archive (covers only, via the MusicBrainz release). Values that cannot be mapped (unknown language, country or role) are left empty and logged.
- **Genre mapping** (outside adapters): in-code tables per source as in ticket 06 (exact names for Discogs genres/styles and MusicBrainz genres, deciding styles replacing the broad genre; keyword rules over normalised free text for Open Library subjects), extended with keyword rules for BN genre/form terms and a prefix table for e-ISBN Thema codes.
- **Throttling and timeouts**: in-process limiter per source (Discogs 60/min moving window, also reading `X-Discogs-Ratelimit-Remaining`; MusicBrainz 1/s; Open Library 3/s; BN and e-ISBN 2/s). Waits at most ~2 s, otherwise the source is `skipped`. A 429/503 with `Retry-After` benches the source until then. Per-request timeout 5 s (e-ISBN 8 s), whole search budget 12 s, no retries.
- **Per-user limit**: 30 searches per minute per user in memory → 429 `lookup.tooManySearches`.
- **Cache**: in-process LRU (~1000 entries), shared across users, key `source + operation + normalised input`, TTL 10 min; misses cached, errors not.
- **User-Agent**: `Shelvio/<version> (+<APP_ORIGIN>/o-aplikacji; <LOOKUP_CONTACT_EMAIL>)` for every source.
- **Cover URLs** are only ever produced by adapters, for an allowlist of hosts per source (e-ISBN, Open Library covers, Cover Art Archive and the archive.org hosts it redirects to); redirects outside the allowlist are refused; a downloaded cover is capped in size. This keeps the save-time fetch from becoming an SSRF.
- **Fake sources**: a scripted catalogue implementing the same interface, selected by `LOOKUP_SOURCES=fake`, covering at least: a Polish ISBN found in BN with an e-ISBN cover; an ISBN with two BN printings; a book text query; a foreign ISBN found in Open Library; a vinyl barcode with several Discogs pressings; a vinyl text query with no barcode; a vinyl code only MusicBrainz knows; a code nobody knows; a code for which every source fails; a cover that never resolves. Fake cover URLs point to a loopback fixture server started by the e2e environment, allowed only by the e2e entrypoint.

### Media

- `FileStorage` seam: `put(key, bytes, contentType)`, `delete(key)`, `list(olderThan)`; an S3 adapter (R2 in production, MinIO locally and in e2e, switched by `S3_ENDPOINT` and `IMAGE_BASE_URL`) and an in-memory adapter for unit/integration tests. Objects are written with `Cache-Control: public, max-age=31536000, immutable` (ADR-0005).
- Keys are fresh random values (at least 128 bits, URL-safe), never UUIDv7, never reused; a replaced photo gets new keys.
- `uploadPhoto(actor, bytes)`: max 10 MB (also enforced by the HTTP adapter before buffering), type by magic bytes (JPEG, PNG, WebP), images over ~40 MP refused; EXIF orientation applied, all metadata stripped; `thumb` (480 px on the longer side) and `large` (1200 px) WebP made synchronously with `sharp`; the original is not kept.
- `storeCoverFromUrl(url)` does the same for a cover (metadata stripped too) and creates a `cover` image.
- **Orphan-image job** (daily): deletes images referenced by no item's cover or photo (soft-deleted items and items of soft-deleted collections count as references) and older than 24 h, objects first, then rows; and deletes stored objects with no `images` row older than 24 h. Moving an item never touches files.
- The frontend downscales photos to ~2400 px on the longer side before upload.

### Account deletion

- The account-hooks implementation wired in the API app now:
  - `summariseAccount(userId)`: one line per owned collection (soft-deleted ones marked) with its item count, from Collections & Access and Catalog.
  - `deleteAccountData(userId, tx)`: `hardDeleteOwnedCollections(userId, tx)`, which hard-deletes the user's owned collections including soft-deleted ones; items, details, credits, genres, shelves and tags go with them through the FK cascades. Their images become orphans for the daily sweep, and creators left without credits for the orphan-creator job. `mvp-sharing` adds Shares and Invitations.
  - `isInvited` and `afterSignIn` stay no-ops until `mvp-sharing`.

### Configuration

The foundations config schema gains: `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `IMAGE_BASE_URL`, `LOOKUP_SOURCES` (`real` | `fake`, default `real`; `fake` refused when `NODE_ENV=production`), `LOOKUP_CONTACT_EMAIL` (required with real sources), `DISCOGS_TOKEN` (optional; when missing, Discogs reports `failed` and a warning is logged at startup). `docker-compose` creates the MinIO bucket with public read. `.env.example` documents them all.

### Frontend

- **Shell slots filled**: "Moje kolekcje" with the user's collections and "+ Nowa" (the "Nowa kolekcja" dialog: one "Nazwa" field and "Utwórz"); the top-bar "Dodaj" button and the mobile FAB. "Wszystko", "Lista życzeń", the top-bar search and "Udostępnione mi" stay empty for `mvp-browse` and `mvp-sharing`.
- **Temporary collection page** on the collection route used by invitation links: title, the Owner's role, a settings link, "Dodaj", a plain list (thumbnail with fallback, title, first creator, type icon) with "load more" by 50, and the empty state "Ta kolekcja jest pusta" / "Dodaj pierwszą pozycję". `mvp-browse` replaces it.
- **"Ustawienia kolekcji"** with two tabs for the Owner: "Ogólne" (name + "Zapisz"; the danger block "Usuń kolekcję" with the brief's text and a confirmation requiring the exact name; afterwards the user lands on the signed-in landing route) and "Półki i tagi" (two lists with item counts, inline rename, delete with the brief's confirmations, "+ Nowa półka", "+ Nowy tag"). `mvp-sharing` adds "Osoby", "Zaproszenia" and the Contributor variant.
- **"Dodaj pozycję"** per UI brief 3.4 and ticket 13: tabs Szukaj / Skanuj / Ręcznie; default tab on desktop Szukaj; on mobile Skanuj first, then the last-used tab remembered in `localStorage` (wrapped in try/catch, falling back to Skanuj); query parameters carry the context (collection, shelf, ownership status, item type) from wherever "Dodaj" was pressed. With no eligible collection, "Dodaj" first opens "Nowa kolekcja" and then continues with the new collection selected. "Edytuj szczegóły" opens the full form inside the add flow; "Anuluj" there returns to the preview.
- **Scanner**: a `BarcodeSource` seam in the frontend. The camera implementation owns `getUserMedia` (`facingMode: environment`, `<video playsinline muted autoplay>`), uses the native `BarcodeDetector` when `getSupportedFormats()` includes `ean_13`, otherwise the `barcode-detector` ponyfill with the self-hosted, lazy-loaded ZXing WASM; formats limited to EAN-13, UPC-A, EAN-8 and UPC-E; the scanner route is lazy-loaded. A pure confirmation function accepts a code only after a valid check digit and the same value on two consecutive frames; a pure classifier routes it (978/979 except 9790 → book). The torch toggle shows only when the track supports it. A still-photo fallback (`<input type="file" accept="image/*" capture="environment">`) decodes one photo with the same detector. Camera refusal or absence shows a message with a way to Szukaj. An **e2e-only build configuration** replaces the camera implementation with one Playwright drives; the production build contains no such implementation.
- **Item form** per UI brief 3.5: eight sections, sticky index and save bar, "Niezapisane zmiany", the discard dialog via a route guard. Typ is editable in "Dodaj pozycję" and read-only in "Edytuj pozycję". Switching type in the add form swaps the details fields and resets credit roles not valid for the new type. Language and country selects list ISO codes with Polish names from `Intl.DisplayNames('pl')`. Price parsing and date parsing reuse the foundations formatting utilities. The new-creator sort name suggestion is a pure utility (book author: last word first, "Nazwisko, Imię"; artist: without a leading "The").
- **Item page** per UI brief 3.3: Edytuj, Przenieś, Usuń and (wanted items) "Mam to" for those allowed (always the Owner here); the "Źródła" line built from the item's external IDs (BN catalogue link from `bn_record_id`, Open Library edition, Discogs release or else master as "Dane z Discogs", MusicBrainz release), none when there are none; the vinyl format line, ISBN hyphenation, money, dates and rating stars via shared pure formatters. Mobile: one back arrow and a "⋮" menu.
- **Dialogs**: "Przenieś" (target list from `listCollectionsWhere`, excluding the current collection, with the brief's note), "Usuń pozycję", "Mam to!".
- **Image component**: one shared `ui` component rendering cover → photo → placeholder (type icon and title) in the fixed 2:3 (book) or 1:1 (vinyl) area, used by the temporary list, the "Mam to!" dialog and later by `mvp-browse`.
- Text goes through a lazy Transloco scope owned by the catalog feature libraries; counts use ICU plurals; the closed vocabulary and hard rules of the UI brief apply (no "added by", no invented fields, empty fields hidden, no undo).

### E2E seed

- The seed gains a collection "Dom" owned by `owner` with shelves "Salon" and "Sypialnia", tags "prezent", "ulubione" and "do-sprzedania", and a few items without images (an owned book, a wanted book with priority, a vinyl record), for read-only tests. Tests that change data create their own collection.
- The e2e entrypoint wires `LOOKUP_SOURCES=fake` and the loopback cover fixture server; MinIO is the storage.

## Testing Decisions

### What makes a good test

- Tests exercise external behaviour through the highest available seam and never assert on internals (which helper ran, Drizzle queries, private methods). A refactor that keeps behaviour keeps tests green.
- Real Postgres (Testcontainers) for everything that persists; fakes only for what lies outside the process and isn't ours (metadata sources, file storage) and for time.
- Each test arranges its own data through operations and asserts on what a caller can observe: returned values, typed errors with their codes, data visible through other operations, files present in the in-memory storage.

### Seams

1. **Domain operations** of Collections & Access, Catalog, Media and Metadata Lookup (primary seam, as for Identity in foundations): Vitest, real Postgres, in-memory `FileStorage`, fake metadata sources, fake clock. Covers:
   - collections: create, rename, soft delete hiding the collection and its items from every operation, non-owner and deleted → `NotFound`;
   - items: create per type with details row, required fields, ISBN normalisation and ISBN-10 conversion, invalid ISBN, role per type, creator credited twice, genre of the other type, organisation from another collection, update replacing credits/genres/tags, fixed type and collection, soft delete, `markOwned` (and `item.notWanted`), move (shelf cleared, tags matched and created, files untouched, same-collection refusal), photo link rules (`image.notLinkable` for someone else's or an already linked image), `updated_by` bumps on edit/move/"Mam to"/photo and not on shelf or tag deletion;
   - visibility: purchase details present for the Owner whatever the status; no `*_by_user_id` in returned shapes;
   - `fromCandidate`: IDs stored from the ref, extra IDs and cover from the cache, save succeeding with only the ref's ID when the candidate can't be re-read, cover failure or timeout (fake clock) saving without a cover;
   - creators: ID match, name match against name and sort name ignoring case and diacritics, conflicting same-source IDs creating a new creator, missing ID filled, BN inversion only for BN, explicit "Utwórz" always new; rename and merge (credits repointed, both-credited case and position renumbering, IDs combined, conflict refused, `search_text` refreshed including soft-deleted items, `updated_*` untouched); orphan-creator job (24 h, soft-deleted items' credits count);
   - duplicates: ISBN and release matches, owned-before-wanted, deleted items and collections excluded, `excludeItemId`, titles and barcodes ignored;
   - shelves and tags: unique names ignoring case, counts, delete effects;
   - genres: list per type, retired hidden but kept on items;
   - media: upload limits (size, magic bytes, pixel count), EXIF stripped and orientation applied, two WebP variants with expected sizes, random distinct keys; orphan-image job (24 h, soft-deleted references kept, stray objects removed);
   - account hooks: summary lines for owned collections, `deleteAccountData` hard-deleting owned collections (soft-deleted included) with everything in them through the foundations `deleteAccount` test, files left to the sweep;
   - lookup orchestrator: routing by ISBN prefix and type, stop at first hit, two BN records, parallel text search ordering and ISBN collapse, Discogs exact barcode filter and "have" ordering, MusicBrainz fallback, scan classification, per-source statuses for hit/miss/fail/timeout/429, skip after the ~2 s limiter wait, `Retry-After` benching, the 12 s budget, cache hits, misses cached and errors not, the per-user limit, genre suggestion mapping (deciding styles, keyword rules, unmatched dropped).
2. **Metadata-source adapters**: parsing tests on recorded real responses committed as fixtures, with an injected `fetch`: BN two printings for one ISBN, "copyright 2014." year, inverted names and Polish roles, missing 041 language, 009 record ID; e-ISBN with and without a cover, `TextContent` never copied; Open Library with missing authors and cover by ID; Discogs format mapping, country mapping, `notes` ignored, master year; MusicBrainz and Cover Art Archive. Cover URL host allowlist.
3. **HTTP adapter** (thin, in-process Nest over real Postgres, foundations prior art): multipart photo upload incl. a body over 10 MB rejected before buffering, `lookup.tooManySearches` as 429 `problem+json`, new error codes rendered with `code`/`params`, item responses without `*_by_user_id`.
4. **Frontend unit tests** (Vitest) for pure code: ISBN normalisation and validation, scan confirmation over a sequence of frames, code classification (978/979/9790/other), vinyl format line, sort-name suggestion, "Źródła" link building, default-tab logic with blocked storage. A **decoder test** runs the `barcode-detector` ponyfill (ZXing WASM) on static images of EAN-13 and UPC-A codes (generated book and vinyl codes plus a few real photos) and asserts the decoded values.
5. **E2E (Playwright, `e2e-fullstack`, fake sources, MinIO)**, desktop and mobile emulation where layout differs:
   - create a collection, rename it, manage shelves and tags, delete it by typing its name;
   - Szukaj: book by ISBN → preview → save → snackbar "Zobacz" → item page with cover from the fixture server and "Źródła"; two printings; vinyl text search with pressings and Discogs attribution; "Nie znaleźliśmy tej pozycji" → "Dodaj ręcznie" with the code kept; "Wyszukiwanie jest chwilowo niedostępne";
   - Skanuj through the e2e code source: one match ("Rozpoznano"), several matches, no match, "Skanuj następny";
   - Ręcznie: book with a new creator and translator, tags and genres; validation and the discard dialog;
   - duplicate notice on a second add of the same ISBN, save still allowed;
   - photo upload in the add form and on edit, replacement, removal, fallback order;
   - edit, "Mam to", move between two owned collections, delete;
   - another account opening the item or collection URL sees "Nie znaleziono".
6. **Manual checks** (not automated): camera scanning on an Android phone and, when available, iOS Safari over HTTPS, covering native vs ponyfill selection, `playsinline`, torch, still-photo fallback and permission refusal; `lookup:smoke` against live sources before relying on adapter changes.

### Prior art

- Foundations' patterns: the Identity domain-operations tests (Testcontainers fixture, fake clock), the thin HTTP adapter tests, the e2e stack with `actors.login`, the seed organised per spec, the `delete-account` CLI target (model for the creator commands) and the daily job runner tests.
- The throwaway barcode scan prototype (`shelvio-mvp/prototypes/barcode-scan-PROTOTYPE/`) shows working source calls, the EAN checksum and two-frame confirmation; it is reference only, not code to copy.

## Out of Scope

- **`mvp-sharing`**: Shares, Invitations, the Contributor and Viewer roles and their answers in `assertCan`, stripping purchase details for Viewers, Contributor collections as add/move targets and in the duplicate scope, the "Osoby" and "Zaproszenia" settings tabs, the Contributor settings variant, the read-only people dialog, the invite dialog, "Udostępnione mi", converting Invitations on sign-in, deleting Shares on account deletion.
- **`mvp-browse`**: the browse screen (grid, list, filters, sorting, text search over `search_text`, collection picker, counts and "Wartość zakupów"), the "Wszystko" landing page, the wishlist view and the "Mam to" button on cards, the top-bar search, and replacing the temporary collection page and its list endpoint.
- Trash, restoring and purging deleted items or collections (ADR-0003).
- Refreshing metadata from a source, hiding or replacing the cover, more than one photo, a lightbox.
- Editing creators in the UI, creator pages and filters, fuzzy creator matching.
- Choosing a Discogs master without a pressing ("album-level data"): the `discogs_master_id` column exists, but no flow sets it alone.
- Tracklists, media and sleeve condition, purchase place, currencies other than PLN.
- Google Books and any other metadata source; bulk import and export.
- Item types beyond books and vinyl records; changing an existing item's type.
- Showing who added or changed items, history, activity feeds, notifications (ticket 21).
- Automated camera tests and iOS device testing; a home-screen PWA.
- Production deployment (custom domain, R2 bucket and Cloudflare setup, Discogs token provisioning in production).
- The MCP server.

## Further Notes

- **Decisions made while writing this spec** (not stated in the map tickets; please confirm):
  - "Przenieś" lives here, restricted to the Owner's own collections, with the move rules of ticket 10; `mvp-sharing` widens the condition (agreed with the user).
  - A temporary collection page with a plain item list exists until `mvp-browse` (agreed with the user).
  - The scanner gets a frontend `BarcodeSource` seam: e2e drives the flow through an e2e-only implementation, a unit test decodes static barcode images, and camera wiring is checked by hand (agreed with the user).
  - The collection settings page with "Ogólne" and "Półki i tagi" tabs belongs to this spec.
  - The read contract carries purchase details and priority regardless of ownership status for those allowed to see them, and the UI hides them per status; this is how "kept but hidden" (tickets 05 and 07) is read, so the edit form can restore kept values.
  - The item type is fixed after creation ("Typ" read-only in "Edytuj pozycję").
  - With no collection, "Dodaj" first opens "Nowa kolekcja".
  - Explicit "Utwórz „…”" always creates a new creator; save-time matching applies to creators coming from a candidate. Candidate creators carry a `sourceKey` so their source IDs are resolved from the candidate on save, not sent by the client.
  - `images.created_by_user_id` restricts linking an uploaded photo to its uploader.
  - Name limits (collection 80, shelf and tag 50, title 500) and case-insensitive uniqueness of shelf and tag names (implied by ticket 10's case-insensitive tag matching on move).
  - Foreign keys from items, shelves and tags to collections cascade, so account deletion hard-deletes through the database; Collections & Access never calls Catalog, avoiding a module cycle.
  - Catalog builds and maintains `items.search_text` now, because `creator:rename` and `creator:merge` (this spec) must refresh it; `mvp-browse` only queries it.
  - Genre mapping is extended to BN genre/form terms and e-ISBN Thema codes (ticket 06 predates those sources).
  - The still-photo fallback on the scan tab follows tickets 03 and 12 though the UI brief does not list it.
- Ticket 15's "throttled queue" and "deleting a collection cascades via foreign keys" are superseded by ticket 22 (skip instead of queue) and ADR-0003 (soft delete; the cascade only serves hard deletion).
- Ticket 05's "creators without items stay" and "Google Books volume ID" are superseded by tickets 26 and 13.
- Ticket 02's advice to retry MusicBrainz with back-off is superseded by ticket 22 (no retries; skip and continue).
- No new glossary terms; all domain terms used are in `GLOSSARY.md`. No ADR conflicts.

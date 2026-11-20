# 13: Duplicate notice

**What to build:** When the selected candidate, or an ISBN typed in the full form, matches an item already in one of the Owner's collections, a soft amber notice says so with a "Zobacz" link; saving still works. See the spec's "Catalog: items" (duplicates) and map ticket 13 ("Duplicate warning").

**Blocked by:** 11 (Lookup tracer: Szukaj with fake sources).

**Status:** ready-for-agent

- [ ] `findDuplicates(actor, { isbn13 | discogsReleaseId | musicbrainzReleaseId }, excludeItemId?)` → `GET /duplicates`: non-deleted items in non-deleted collections from `listCollectionsWhere(actor, 'item:edit')`; books by ISBN-13, vinyl by Discogs or MusicBrainz release ID; never by title or vinyl barcode.
- [ ] Preview notice: owned match first, "Masz już tę pozycję w kolekcji …", else wanted match, "Ta pozycja jest na liście życzeń w kolekcji …", each with "Zobacz" to that item.
- [ ] Full form (add and edit): the same check once a valid ISBN is entered (excluding the edited item), and for items prefilled from a candidate by its release IDs.
- [ ] Never blocks saving.
- [ ] Domain tests: ISBN and release matches, owned-before-wanted ordering available to the UI, deleted items and deleted collections excluded, `excludeItemId`, another user's items not matched, titles and barcodes ignored.
- [ ] E2E: adding the same ISBN twice shows the notice, and the second save still succeeds.

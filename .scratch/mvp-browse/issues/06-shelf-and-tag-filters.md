# 06: Shelf and tag filters

**What to build:** Looking at exactly one collection, the user filters by shelf (including "Bez półki") and by tags; with several collections these filters disappear and any set value is dropped. See the spec's "Browse query" (shelf and tag filters) and "Frontend: routes and URL state" (normalisation).

**Blocked by:** 02 (Collection picker), 05 (URL state and the filter panel).

**Status:** ready-for-agent

- [ ] `browseItems` `shelfIds` + `noShelf` (OR'ed) and `tagIds`; more than one collection in scope → `ValidationFailed` `browse.organisationNeedsOneCollection` (Polish translation added); IDs of another collection match nothing.
- [ ] `GET /browse/items` parameters `shelf` (repeatable, `none`) and `tag` (repeatable).
- [ ] Panel sections "Półka" and "Tagi" from the selected collection's shelves and tags, only when exactly one collection is selected; chips for their values.
- [ ] Normalisation drops shelf and tag values when the selection is not exactly one collection and drops IDs not in that collection.
- [ ] Domain tests: shelf, "Bez półki", tags OR'ed, combined with other filters, several collections refused, foreign IDs match nothing.
- [ ] Frontend unit tests: drop rules for several collections and unknown IDs.
- [ ] E2E: filter "Dom" by shelf "Salon" and by a tag; widening the picker to both collections removes the shelf chip.

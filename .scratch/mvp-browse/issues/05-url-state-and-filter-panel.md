# 05: URL state and the filter panel

**What to build:** A "Filtry" button opens a side panel (a bottom sheet on mobile) where the user narrows the view by item type, ownership status, consumed, minimum rating, genres and priority; filters apply instantly, show as removable chips with "Wyczyść filtry", put a dot on "Filtry", and live in the URL so Back undoes them and links reproduce them. See the spec's "Browse query", "REST endpoints", "Frontend: routes and URL state" and "Frontend: screen" (chips row, filter panel).

**Blocked by:** 01 (Browse tracer).

**Status:** ready-for-agent

- [ ] `browseItems` filters: `itemTypes`, `ownershipStatuses`, `consumed`, `rating { min, unrated }` (OR'ed), `genreIds` + `noGenre` (OR'ed), `priorities` (wanted items only); OR within a filter, AND across, AND with search.
- [ ] `GET /browse/items` parameters `type`, `status`, `consumed`, `minRating`, `unrated`, `genre` (repeatable, `none`), `priority`.
- [ ] Pure URL ↔ browse-state functions per preset: defaults omitted, normalisation entry point (later tickets add rules), rewrite with `replaceUrl` when something was dropped; every filter change pushes a history entry.
- [ ] Panel per UI brief 3.1 order: typ, status, przeczytane / przesłuchane (tak / nie), ocena minimalna (single choice "5", "4+", "3+", "Bez oceny"), gatunki (incl. "Bez gatunku"; the selected type's list or both lists under "Książki" / "Winyle"; retired genres not offered), priorytet; no per-value counts; instant apply; right overlay on desktop, bottom sheet on mobile.
- [ ] Chips: one per active value, removable; "Wyczyść filtry" clears filters and the search text, keeping collection selection and preset; defaults are never chips; dot on "Filtry" when any non-default filter is active.
- [ ] Domain tests: each filter alone and combined, OR/AND semantics, "Bez gatunku", "Bez oceny" OR'ed with a minimum rating, priority ignoring owned items' kept priority.
- [ ] HTTP adapter test: repeatable and `none` parameters, out-of-range values → `problem+json`.
- [ ] Frontend unit tests: URL ↔ state round trip, chip list from state, filter-dot rule.
- [ ] E2E: filter by type, status, genre and minimum rating; remove a chip; "Wyczyść filtry"; "Brak wyników" with "Wyczyść filtry"; Back undoes a filter; mobile bottom sheet.

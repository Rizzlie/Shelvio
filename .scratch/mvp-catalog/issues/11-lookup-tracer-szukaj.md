# 11: Lookup tracer: Szukaj with fake sources

**What to build:** In the "Szukaj" tab of "Dodaj pozycję" the Owner picks Książka or Winyl, types an ISBN, EAN, title, artist or catalogue number, sees candidates from the (fake) metadata sources, selects one, checks the preview and saves it with "Zapisz" or opens the full form with "Edytuj szczegóły"; the saved item keeps its source IDs and shows the "Źródła" line. The whole path runs on fake sources; real adapters arrive in tickets 16–20. See the spec's "Metadata Lookup", "Catalog: items" (`fromCandidate`), "Catalog: creators" (candidate creators) and UI brief 3.4.

**Blocked by:** 04 (Creators and credits).

**Status:** ready-for-agent

- [ ] Metadata Lookup `domain` and `feature` libraries; shared `Candidate` contract (`ref` as `source:sourceId`, `source`, `detail`, common and nested per-type fields, external IDs, creators with `name`, `sortName?`, `role`, `sourceKey?`, Discogs release page URL); `MetadataSource` interface (`searchByCode`, `searchByText`, `getCandidate`, `findCover`).
- [ ] Orchestrator with the full routing: ISBN normalisation and `lookup.invalidIsbn`; Polish ISBNs BN → e-ISBN → Open Library, others Open Library → BN, stop at the first hit, all its records as candidates, no merging; book text BN + Open Library in parallel, BN and Polish editions first, same ISBN collapsed, at most 20 per source; vinyl 12–13 digits → Discogs barcode with exact digit match, other text → Discogs `q`, sorted by "have", at most 25, MusicBrainz only when Discogs has nothing or fails; scan classification (978/979 except 9790 → book) when no `itemType`; per-source statuses `hit`/`miss`/`failed`/`skipped`; a failing source skipped.
- [ ] `POST /lookups/search` and `GET /lookups/candidates/{ref}`, authentication only.
- [ ] Fake sources selected by `LOOKUP_SOURCES` (`real` | `fake`; `fake` refused when `NODE_ENV=production`; config schema and `.env.example`), wired by the e2e entrypoint, with the scripted catalogue from the spec (except covers, added in ticket 15).
- [ ] `createItem` accepts `fromCandidate`: the ref's own ID column always stored; extra IDs from the full candidate (cache or re-fetch) best effort; field values never rebuilt from the cache.
- [ ] Candidate creators `{ candidateCreator: { name, sortName?, sourceKey } }` matched on save: source ID first, then exact normalised name (case- and diacritic-insensitive) against name or sort name, oldest match wins; refused on conflicting same-source IDs (new creator); missing ID added; else created silently.
- [ ] Szukaj tab: Typ toggle, one input, search on Enter or "Szukaj" only, "Znaleziono N wyników" (ICU); candidate rows with cover placeholder, title, creator, year, source label; vinyl rows add label + catalogue number, country, format; "Data provided by Discogs." linked to the release page next to Discogs candidates; opening from a vinyl-filtered context preselects Winyl.
- [ ] Preview (separate screen on mobile): title, creators with roles, key fields, Mam / Chcę mieć, "Zapisz" and "Edytuj szczegóły" (the full form prefilled inside the add flow; "Anuluj" returns to the preview). Shelf and suggested genres arrive in ticket 12.
- [ ] States: "Nie znaleźliśmy tej pozycji" (no hits, some `miss`) with "Dodaj ręcznie" keeping type and code; "Wyszukiwanie jest chwilowo niedostępne" (no hits, no `miss`) with "Spróbuj ponownie" and "Dodaj ręcznie".
- [ ] After saving: search cleared, type and collection kept, snackbar "Dodano do kolekcji …" with "Zobacz".
- [ ] Item page "Źródła" line built from external IDs (Biblioteka Narodowa from `bn_record_id`, Open Library edition, "Dane z Discogs" for the release or else the master, MusicBrainz release), absent without IDs; a pure link builder with unit tests.
- [ ] Desktop opens on Szukaj; the tab bar shows Szukaj and Ręcznie (Skanuj in ticket 21).
- [ ] Domain tests with fake sources: routing for every input kind, stop at first hit, two BN records, text ordering and ISBN collapse, Discogs exact barcode filter and ordering, MusicBrainz fallback, statuses, `fromCandidate` IDs with and without a readable candidate, candidate-creator matching rules.
- [ ] E2E: book by ISBN → preview → save → item page with "Źródła"; two printings offered; vinyl text search with pressings and Discogs attribution; not found → "Dodaj ręcznie" with the code kept; all sources failing → unavailable state.

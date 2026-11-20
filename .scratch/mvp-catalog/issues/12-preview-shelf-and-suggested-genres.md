# 12: Preview shelf and suggested genres

**What to build:** The lookup preview lets the Owner choose the shelf (or create one) and Mam / Chcę mieć with sensible defaults, and shows genres suggested from the source as "sugerowany" chips that "Zapisz" confirms; the full form preselects them too. See the spec's "Metadata Lookup" (genre mapping), "Catalog: genres, shelves, tags", map ticket 06 and map ticket 13 ("Preview defaults").

**Blocked by:** 05 (Genres), 06 (Shelves and tags), 11 (Lookup tracer: Szukaj with fake sources).

**Status:** ready-for-agent

- [ ] Genre mapping outside the adapters, from raw source genre hints to Shelvio slugs: exact-name tables for Discogs genres/styles (deciding styles replace the broad genre; `rock` added only with plainly rock styles; "Folk, World, & Country" without a deciding style → `folk`) and MusicBrainz genres; keyword rules over normalised free text (lowercase, no diacritics) for Open Library subjects. Unmatched values dropped and logged only; source genre names never leave the module.
- [ ] Full candidates carry `suggestedGenres` (slugs); fake sources supply hints exercising the rules.
- [ ] Preview: "Półka" select with the collection's shelves, "Bez półki" and "+ Nowa półka"; Mam / Chcę mieć; suggested genres as "sugerowany" chips with ✕.
- [ ] Defaults: Mam, or Chcę mieć when opened from the wishlist / wanted context; the shelf from the shelf context, else "Bez półki".
- [ ] "Edytuj szczegóły" preselects the suggested genres marked "sugerowany" in the Gatunki picker.
- [ ] Unit tests of the mapping tables (deciding styles, keyword rules, unmatched dropped); domain test that a full candidate carries the expected slugs.
- [ ] E2E: a vinyl candidate with suggested genres saved via "Zapisz" onto a new shelf; one suggestion removed before saving.

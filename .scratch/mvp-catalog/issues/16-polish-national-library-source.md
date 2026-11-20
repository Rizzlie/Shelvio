# 16: Polish National Library source

**What to build:** With real sources enabled, book lookups reach the Polish National Library (`data.bn.org.pl`) for ISBNs and title/author text, so Polish books are found with clean creators, publisher, year, pages, series and language; this ticket also switches the app from fakes to real sources and adds the manual live smoke check. See the spec's "Metadata Lookup" (adapters, User-Agent), "Configuration", map ticket 18 and `research/polish-book-coverage.md`.

**Blocked by:** 12 (Preview shelf and suggested genres), 14 (Lookup resilience).

**Status:** ready-for-agent

- [ ] Real-source wiring for `LOOKUP_SOURCES=real`: `LOOKUP_CONTACT_EMAIL` required (config schema, `.env.example`), one User-Agent `Shelvio/<version> (+<APP_ORIGIN>/o-aplikacji; <email>)` for every source; sources not yet implemented report `failed`.
- [ ] BN adapter over the institutions bibs endpoint: ISBN search with digits only, text search by title/author (Polish first); parses MARC rather than the concatenated flat fields: 245 title/subtitle/volume, 100/700 names with `$e` roles mapped to author/translator (other roles dropped; no role on older records means author), MARC dates and trailing punctuation stripped, "Surname, Name" inverted into name + sort name, 260/264 publisher and year (incl. "copyright 2014."), 300 first number as pages, 041 or 008 language → ISO 639-1, 490 series and volume, 009 as `bn_record_id`; 655/380 terms as genre hints. No covers.
- [ ] Genre mapping gains keyword rules for BN genre/form terms (e.g. Powieść fantastyczna → fantasy, Kryminał → crime-thriller, Komiks / Manga → comics).
- [ ] Unmappable values (language, role) left empty and logged.
- [ ] A manual `lookup:smoke` target that runs a few known ISBNs and queries against the live sources and prints the parsed candidates; never run in CI.
- [ ] Adapter tests on recorded responses committed as fixtures with an injected `fetch`: two printings for one ISBN, "copyright 2014." year, inverted names and Polish roles, missing 041, 009 record ID, translator roles, series and volume.

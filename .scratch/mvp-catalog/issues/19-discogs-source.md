# 19: Discogs source

**What to build:** Vinyl lookups by barcode, artist, title or catalogue number reach Discogs, showing pressings that can be told apart and copying only the fields Discogs places under CC0 (plus country). See the spec's "Metadata Lookup" (adapters), ADR-0004, map tickets 02 and 13 and `research/vinyl-metadata-api.md`.

**Blocked by:** 15 (Covers from lookups), 16 (Polish National Library source).

**Status:** ready-for-agent

- [ ] Discogs adapter with the personal token sent server-side; `DISCOGS_TOKEN` optional in config (missing → Discogs reports `failed` and a startup warning); remaining-count header fed to the limiter.
- [ ] Barcode search with `type=release&format=Vinyl` and exact digit match on our side; text search `q` restricted to vinyl releases; summary rows with title, artists, year, label + catalogue number, country, format text, community "have" count, release page URL and live picker image URL.
- [ ] Full candidate from the release: CC0 fields only (title, artists with artist IDs, label, catalogue number, dates, format, barcode and identifiers) plus country mapped to ISO 3166; format descriptions mapped to disc count, size, speed, release kind and reissue, with the remainder (e.g. "180 Gram", "Gatefold") in format notes; `notes` never copied; master ID kept and original year read from the master when present; genres and styles as genre hints only.
- [ ] No Discogs image is ever stored; `findCover` defers to Cover Art Archive (ticket 20) and returns null until then.
- [ ] Included in `lookup:smoke`.
- [ ] Adapter tests on recorded fixtures: a barcode with many pressings and non-matching identifier strings filtered out, CD results excluded, format and country mapping, `notes` ignored, master year.

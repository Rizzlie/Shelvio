# Polish book coverage

Type: research
Status: resolved
Blocked by: none
Map: [Shelvio MVP](../map.md)

## Question

Which source best covers Polish books, given Open Library resolved only 6 of 20 sampled Polish ISBNs?

- Re-run the 20 ISBNs listed in [research/book-metadata-api.md](../research/book-metadata-api.md) against Google Books **with an API key**.
- Evaluate the Polish National Library API (`data.bn.org.pl`) as a lookup source: licence/terms, rate limits, fields, ISBN search; it has no covers.
- Recommend the lookup order (e.g. Open Library → National Library → Google Books) and say whether Google Books is still worth its no-storing/attribution constraints.

## Comments

**2026-11-20, unblocked from [API credentials for metadata lookups](17-api-credentials.md).** No API key yet: query Google Books without a key. Its anonymous quota is plenty for 20 ISBNs, and results do not depend on the key.

## Answer

Resolved 2026-11-20. Full findings: [research/polish-book-coverage.md](../research/polish-book-coverage.md).

- **Polish National Library (`data.bn.org.pl`) is the primary source for Polish ISBNs.** Its data is CC0 1.0, it needs no key, and it publishes no rate limit. It found 20/20 ISBNs on the ticket sample (biased, since the sample came from BN) and 17/20 on an independent 2024 sample. Its MARC records hold creators with roles, publisher, year, pages, series and Polish genre/form terms. It has no covers.
- **e-ISBN (`e-isbn.pl/IsbnWeb/api.xml`) comes second.** It is BN's publisher-fed ONIX API, also keyless. It found 2 of the 3 BN misses, so BN plus e-ISBN reached 19/20. Some records link a cover that publishers agreed may be reused "for informational purposes". It states no data licence, so copy factual fields only and never the blurb.
- **Lookup order**: for `978-83`/`83` ISBNs, BN → e-ISBN → Open Library → manual entry. For other ISBNs, Open Library → BN → manual entry. Fetch the cover in parallel: the e-ISBN cover if there is one, otherwise Open Library. Strip hyphens first, since both BN and e-ISBN return nothing for hyphenated ISBNs. Neither API sends CORS headers, so lookups go through the backend.
- **Google Books: drop it from the MVP.** Keyless calls still get `429` with a daily quota of `0`, so the comment's assumption about the anonymous quota was wrong and Google's Polish coverage remains unmeasured. Polish sources already cover the gap, so the API key, the "powered by Google" logo and the no-storing rules are not worth carrying.
- **Follow-up outside this ticket**: ADR-0004, the **Metadata source** entry in `GLOSSARY.md`, and the "Źródła" line and "O aplikacji" credits in the UI brief name only Open Library, Google Books, Discogs and MusicBrainz. They need updating to add BN and e-ISBN (and to remove Google if that is agreed).

**Addendum 2026-11-20 (Google Books measured with an API key).** Google found 20/20 of the ticket sample and the one Empik Go title BN + e-ISBN missed, but no publisher on any Polish record, few covers (not storable) and sometimes stripped diacritics. Recommendation revised: Google is a viable last-resort fallback (BN → e-ISBN → Open Library → Google → manual); whether to keep it is decided in [Add item flow](13-add-item-flow.md). Details in the research addendum.

# Book metadata API

Type: research
Status: resolved
Blocked by: none
Map: [Shelvio MVP](../map.md)

## Question

Which source(s) should Shelvio use to look up books by ISBN and by title or author: Google Books, Open Library, or both (one as a fallback)?

For each candidate, find out:
- coverage, especially for **Polish** editions,
- whether ISBN-10 and ISBN-13 lookup works,
- which fields come back: title, authors, publisher, year, language, page count, subjects/categories (to feed genre mapping), cover images and their sizes,
- authentication (API key?), quotas and rate limits, and pricing at our scale,
- terms of use: attribution, whether covers may be **stored and resized on our servers** or must be hotlinked, and caching rules.

Recommend a primary source and a fallback.

## Answer

Primary: **Open Library**. It needs no key, caching is encouraged, the metadata may be stored, and ISBN-10 and ISBN-13 both work. Rate limit is 3 req/s with an identifying User-Agent.
Fallback: **Google Books API** with an API key (keyless calls get a quota of 0). Use it only to pre-fill the form. Its ToS forbid permanent copies and modification, so never store or resize its covers, and show "powered by Google" attribution.
Polish coverage on Open Library is weak: 6 of 20 real Polish ISBNs, often with no cover, author or subjects. Manual entry with a user-uploaded cover is therefore a core flow. Google's Polish coverage could not be measured without a key; re-run the 20-ISBN test with a key before implementing.
The two ISBNs in the original brief fail the checksum, so validate ISBNs before calling any API. Details: [research/book-metadata-api.md](../research/book-metadata-api.md)

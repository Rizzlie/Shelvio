# 18: Open Library source

**What to build:** Foreign books are found by ISBN in Open Library first, title/author searches include Open Library results, and Open Library supplies covers for books when e-ISBN has none. See the spec's "Metadata Lookup" (adapters), map tickets 01 and 13 and `research/book-metadata-api.md`.

**Blocked by:** 15 (Covers from lookups), 16 (Polish National Library source).

**Status:** ready-for-agent

- [ ] Open Library adapter: ISBN and text search through the search endpoint so author names come in one call (author keys kept as creator source IDs); edition and work IDs; title, subtitle, publisher, year from free-text dates, page count, language; subjects (edition, else work) as genre hints; full candidate re-read by edition.
- [ ] `findCover` by cover ID (never by ISBN, to avoid the per-IP cap), falling back to the work's cover; the covers host on the allowlist.
- [ ] Rate 3/s with the identifying User-Agent (limiter from ticket 14).
- [ ] Included in `lookup:smoke`.
- [ ] Adapter tests on recorded fixtures: a hit with authors and cover, an edition without authors or cover (work fallback), ISBN-10 and ISBN-13, a miss.

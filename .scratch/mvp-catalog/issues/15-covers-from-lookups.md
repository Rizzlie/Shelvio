# 15: Covers from lookups

**What to build:** Candidates show their cover as soon as the backend finds it (placeholder until then), and saving a candidate copies its permitted cover into Shelvio's storage once, best effort, so the item page and lists show it; a cover that can't be fetched never blocks the save. See the spec's "Catalog: items" (cover on save), "Media" (`storeCoverFromUrl`), "Metadata Lookup" (cover URLs, fake sources) and ADR-0004/0005.

**Blocked by:** 09 (Item photos), 11 (Lookup tracer: Szukaj with fake sources).

**Status:** ready-for-agent

- [ ] `findCover(ref)` → `GET /lookups/candidates/{ref}/cover` returning `{ url } | null`; the browser loads the picker image straight from the source; Discogs candidates use their live image URL in the picker only.
- [ ] Cover URLs are produced only by adapters for a per-source host allowlist; redirects outside the allowlist refused; downloads capped in size.
- [ ] `storeCoverFromUrl(url)` in Media: fetch once (~10 s timeout, no retry), metadata stripped, `thumb` and `large` WebP, a `cover` image row.
- [ ] `createItem` with `fromCandidate`: before the insert transaction resolves the cover from the ref (cache, else re-fetch) and stores it; any failure saves the item without a cover; Discogs images never stored; image URLs never accepted from the client.
- [ ] Candidate rows and the preview show a placeholder, then the cover when `findCover` answers; saving before it answered still copies the cover.
- [ ] Item page, temporary list and "Mam to!" dialog show the stored cover through the shared picture component (cover before photo); the form's "Okładka" slot shows it read-only.
- [ ] The e2e environment starts a loopback fixture server for fake cover images; only the e2e entrypoint allows loopback cover hosts; fake sources gain a candidate with a cover and one whose cover never resolves.
- [ ] Domain tests (fake sources, in-memory storage, fake clock): cover stored on save, timeout and fetch failure saving without a cover, disallowed host refused, Discogs image never stored.
- [ ] E2E: save a book candidate with a cover and see it on the item page and in the list; a candidate whose cover never resolves still saves.

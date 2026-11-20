# 14: Lookup resilience

**What to build:** Lookups stay fast and polite under load and outages: each source is throttled, slow or rate-limited sources are skipped, the whole search answers within about 12 seconds, repeated lookups hit a short cache, and a user searching too often sees "Zbyt wiele wyszukiwań, spróbuj za chwilę". See the spec's "Metadata Lookup" (throttling and timeouts, per-user limit, cache) and map ticket 22.

**Blocked by:** 11 (Lookup tracer: Szukaj with fake sources).

**Status:** ready-for-agent

- [ ] In-process limiter per source (Discogs 60/min moving window, also honouring a remaining-count header reported by the adapter; MusicBrainz 1/s; Open Library 3/s; BN and e-ISBN 2/s), waiting at most ~2 s before marking the source `skipped`.
- [ ] A 429/503 with `Retry-After` benches the source until then.
- [ ] Per-request timeout 5 s (e-ISBN 8 s), whole search budget 12 s, no retries; timed-out sources reported `failed`.
- [ ] In-process LRU cache (~1000 entries) shared across users, key `source + operation + normalised input`, TTL 10 min; misses cached, errors not; `getCandidate` and save-time candidate reads use it.
- [ ] 30 searches per minute per user in memory → 429 `problem+json` with `lookup.tooManySearches`, translated in the UI.
- [ ] Fake sources can simulate slowness, timeouts, 429 with `Retry-After` and remaining-count headers.
- [ ] Domain tests with a fake clock: limiter skip, benching, per-request timeout, 12 s budget, cache hit, miss cached, error not cached, TTL expiry, per-user limit and reset. HTTP test: 429 `problem+json`.

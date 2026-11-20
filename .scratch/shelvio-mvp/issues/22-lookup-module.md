# Lookup module and external API proxying

Type: grilling
Status: resolved
Blocked by: none
Map: [Shelvio MVP](../map.md)

## Question

What is the shape of the backend module that runs lookups against metadata sources?

The add flow is fixed by [Add-item flow](13-add-item-flow.md): source chains and routing per item type, a separate cover fetch, skip-on-failure, the "unavailable" state. Lookups must go through the backend (the Discogs token is a secret) and may cache responses only for minutes within one add flow ([ADR-0004](../../../docs/adr/0004-lookups-are-one-time-prefills.md)). Decide:
- the domain operations and REST endpoints (search, candidate details, cover), and the candidate contract shared by all sources,
- the metadata-source adapter seam (one adapter per source; where parsing such as BN MARC or e-ISBN ONIX lives),
- per-source throttling (Discogs 60 req/min shared by all users, MusicBrainz ~1 req/s, BN's 429s), timeouts, and how a throttled request is queued or failed,
- the short-lived cache: where it lives (memory vs. Postgres on a single Render instance), its key and TTL,
- the User-Agent and contact policy each source requires,
- how saving turns a chosen candidate into an item (does the client send the prefilled fields, or a candidate reference the backend re-reads from the cache?),
- how lookups are tested without hitting live APIs.

## Answer

Resolved 2026-11-20 (grilling with the user; every recommendation accepted). "Candidate" added to `GLOSSARY.md`. No ADR: everything here is cheap to change behind the module's operations.

**Operations and endpoints.** Three domain operations in the Metadata Lookup module, needing authentication only (no collection permission); the future MCP server can reuse them.
- `searchCandidates` → `POST /lookups/search` with `{ itemType?, code | query }`: returns summary candidates plus `sources: [{ source, status: 'hit' | 'miss' | 'failed' | 'skipped' }]`. One synchronous response, no streaming. The UI derives "not found" (no hits, some source said `miss`) versus "Wyszukiwanie jest chwilowo niedostępne" (no hits, no source said `miss`).
- `getCandidate` → `GET /lookups/candidates/{ref}`: the full candidate that prefills the preview. Two steps because Discogs and Open Library search results are thin (fetching `/releases/{id}` for 25 pressings would spend half the Discogs minute on one search); when a source already returned a full record at search time (BN, e-ISBN), this step reads it from the cache.
- `findCover` → `GET /lookups/candidates/{ref}/cover`: `{ url } | null`. The backend resolves the URL (OL `cover_i`, e-ISBN, CAA via MusicBrainz); the browser loads the image straight from the source, picker only. Discogs image URLs (signed, display-only) come with the candidate.

**Candidate contract.** One Zod `Candidate` in `libs/shared/contracts`: `ref` (opaque string `source:sourceId`), `source`, `detail: 'summary' | 'full'`, common fields, per-type fields nested as in the item contract, external IDs, raw `genreHints`. Summary carries title, creators, year, publisher/label, country, format, ref.

**Saving.** The client sends an ordinary `createItem` with the (possibly edited) fields plus an optional `fromCandidate: ref`. The backend uses the ref only to store external IDs (attribution, creator matching) and to copy the cover, re-resolving the cover URL from the ref (cache, else re-fetch) and never accepting an image URL from the client (no SSRF, no storing Discogs images). Fields are never rebuilt from the cache, so an expired cache never fails a save.

**Adapter seam.** One `MetadataSource` adapter per source (BN, e-ISBN, Open Library, Discogs, MusicBrainz; Cover Art Archive for covers only) with `searchByCode`, `searchByText`, `getCandidate`, `findCover`. Parsing (BN MARC, e-ISBN ONIX, JSON) lives inside the adapter and yields the shared `Candidate`. Source genres leave adapters as raw `genreHints`; mapping to Shelvio genre suggestions (Genre lists and mapping table) happens outside them. Routing and chains (ISBN normalisation, prefix routing, stop at first hit, BN+OL in parallel, MusicBrainz fallback) live in the module's orchestrator.

**Throttling and timeouts.** In-process limiter per source: Discogs 60/min moving window, also reading `X-Discogs-Ratelimit-Remaining` (so a restart re-learns the real state); MusicBrainz 1/s; Open Library 3/s (identified); BN and e-ISBN 2/s out of politeness. No queuing beyond ~2 s wait: the source is `skipped` and the chain continues. A 429/503 with `Retry-After` benches the source until then. Per-request timeout 5 s (e-ISBN 8 s); whole `search` budget 12 s; no retries. Assumes a single API instance; scaling out would mean moving the limiter to Postgres.

**Per-user limit.** In-memory 30 `search`/min per user; over it → 429 with an error code ("Zbyt wiele wyszukiwań, spróbuj za chwilę"). The UI runs text search on Enter or the button, not per keystroke.

**Cache.** In process memory, LRU ~1000 entries, shared across users, key `source + operation + normalised input` (e.g. `discogs:release:123`, `bn:isbn:9788308039441`), TTL 10 min. Misses are cached, errors are not. Sleep/restart clears it; Postgres is not used (ADR-0004 allows minutes only).

**User-Agent.** One for all sources: `Shelvio/<version> (+https://app.<domain>/o-aplikacji; <email>)`, the email from required env var `LOOKUP_CONTACT_EMAIL` (a dedicated project address, not a personal one), validated at startup with the Discogs token.

**Testing.** Adapter parsing tests on recorded real responses committed as fixtures (incl. research edge cases: two BN records per ISBN, "copyright 2014." year, inverted names) with an injected `fetch`; orchestrator tests through the domain operations with fake sources (hit/miss/fail/timeout/429 scenarios) and a fake clock for the limiter; `LOOKUP_SOURCES=fake` for Playwright e2e and CI; a manual `lookup:smoke` script against live APIs, never in CI.

**Local development.** One `nx serve api` process, so cache and limiter behave as on Render; watch-mode restarts clear them (harmless). Real sources by default (`LOOKUP_SOURCES=fake` to switch); secrets in an untracked `.env`. A missing Discogs token does not stop the local backend: Discogs reports `failed` and MusicBrainz takes over. e2e and CI always use fakes.

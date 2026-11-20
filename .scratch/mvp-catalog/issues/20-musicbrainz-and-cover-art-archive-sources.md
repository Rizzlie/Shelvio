# 20: MusicBrainz and Cover Art Archive sources

**What to build:** When Discogs has nothing or fails, vinyl lookups fall back to MusicBrainz, and vinyl items get a stored cover from the Cover Art Archive. See the spec's "Metadata Lookup" (adapters), ADR-0004, map ticket 02 and `research/vinyl-metadata-api.md`.

**Blocked by:** 15 (Covers from lookups), 16 (Polish National Library source).

**Status:** ready-for-agent

- [ ] MusicBrainz adapter: release search by barcode, catalogue number or text, vinyl media only; full candidate re-fetched by MBID with artist credits (artist MBIDs as creator source IDs), labels, release group (ID and first-release year as original year), media format mapped to size and disc count; genres as genre hints only; 1 req/s through the limiter.
- [ ] Cover Art Archive used only for covers: `findCover` for vinyl candidates resolves the front image of the MusicBrainz release (for Discogs candidates via a MusicBrainz barcode lookup), with the CAA and archive.org hosts on the allowlist.
- [ ] Included in `lookup:smoke`.
- [ ] Adapter tests on recorded fixtures: barcode search with several releases, a release with and without cover art, release-group year, 503 handled as `failed`.

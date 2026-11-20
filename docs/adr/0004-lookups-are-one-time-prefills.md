# Metadata lookups are one-time prefills, not mirrors

A lookup in a metadata source (Polish National Library, e-ISBN, Open Library, Discogs, MusicBrainz) only fills in the form for a new item. When the user saves, the values are copied into Shelvio's own columns and the item becomes the user's record: they may edit any field, and Shelvio never re-fetches or refreshes it from the source. The backend keeps no copy of raw API responses beyond a short-lived cache (minutes) during one add flow. Stored external IDs serve only for attribution links and creator matching, never for syncing.

We did this because the providers' terms clash with a live mirror. Discogs forbids showing its content more than six hours stale and caching it "longer than necessary". e-ISBN states no data licence, so its publisher-supplied descriptions cannot be assumed free. Copying only freely licensed or purely factual fields once, at the user's confirmation, keeps Shelvio clear of both rules. It also spends API rate limits (Discogs: 60 req/min) on adding items only, not on keeping thousands of them fresh.

## What may be copied

- **Discogs**: only fields its API terms place under CC0 (title, credits/artists, label, catalogue number, dates, format, barcode and identifiers), plus country. Discogs `notes` are never copied into the user's notes. Images are Restricted Data: shown live in the candidate picker only, never stored.
- **Polish National Library (BN, `data.bn.org.pl`)**: CC0, all fields may be copied, plus the BN record number. No covers exist there.
- **e-ISBN**: no licence stated, so factual fields only (title, subtitle, creators, publisher, year, page count, ISBN, language). Publisher prose (`TextContent`: blurbs, bios, tables of contents) is never copied. Its covers carry the publisher's consent to reuse "for informational purposes" and may be copied and resized like Open Library covers (one per user-added item, never bulk).
- **Open Library, MusicBrainz**: core data is open/CC0 and may be copied. Covers from Open Library and Cover Art Archive may be copied into our storage and resized (one per user-added item, never bulk).
- **Genres and styles** from Discogs (not CC0) and MusicBrainz genre tags (CC BY-NC-SA) are never stored. They only feed suggestions mapped onto Shelvio's own controlled genre lists, and the item stores Shelvio genre IDs.

## Consequences

- Attribution is required where provider data is shown: "Data provided by Discogs." (linked, no `nofollow`) next to Discogs results in the candidate picker; a "Źródła" line of links derived from the item's external IDs on the item page; and a public "O aplikacji" page with the Discogs non-affiliation notice, credits and a contact for rights holders.
- Corrections made upstream after an item was added never reach it. A "refresh metadata" action is out of scope for the MVP.

## Considered options

- **Live link with periodic re-fetch**: rejected. It would need a refresh queue to meet the six-hour rule, a merge policy for user edits versus source changes, and hours of rate-limited calls per full refresh, all to keep data the user can already correct by hand.

## Amendments

- 2026-11-20 ([Add-item flow](../../.scratch/shelvio-mvp/issues/13-add-item-flow.md)): Google Books dropped from the MVP (its only unique find in testing was an e-book, its Polish records lacked publishers, and it cost a secret, an adapter and attribution for ~5% of lookups); BN and e-ISBN added as book sources. Google can return later through the metadata-source adapter seam under the old rule: factual fields and the volume ID only, no covers stored, "powered by Google" attribution.

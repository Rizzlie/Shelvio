# Third-party data licensing and attribution

Type: grilling
Status: resolved
Blocked by: 01, 02
Map: [Shelvio MVP](../map.md)

## Question

What may Shelvio copy into an item from each metadata source, and what attribution must it show?

Research found conflicting rules:
- **Discogs**: data must not be shown if older than 6 hours, but titles, formats, tracklists, barcodes and label names are CC0; genres/styles and images are restricted, non-commercial. Attribution "Data provided by Discogs." with a link is required.
- **Google Books**: no permanent copies, no modifying content; "powered by Google" and a link required.
- **Open Library / MusicBrainz**: core data CC0 or open; covers are copyrighted by their owners.

Decide the policy: treat lookups as a **one-time prefill that the user confirms and owns as their own record** (copy only freely licensed fields), or keep a live link and re-fetch; where attribution appears in the UI; and what this means for genres sourced from Discogs (feeds Genre lists and mapping). Likely an ADR. Shelvio is non-commercial.

## Answer

Resolved in a grilling session on 2026-11-20. Recorded as [ADR-0004](../../../docs/adr/0004-lookups-are-one-time-prefills.md); `GLOSSARY.md` gains **Lookup** and **Metadata source**.

1. **A lookup is a one-time prefill, not a mirror.** On save, values are copied into Shelvio's columns and the item becomes the user's own, editable record. It is never re-fetched or refreshed. The backend stores no raw API responses, at most a cache of a few minutes within one add flow. External IDs are kept only for attribution links and creator matching.
2. **Discogs**: copy only the CC0 fields (title, credits/artists, label, catalogue number, dates, format, barcode, identifiers) plus country. Discogs `notes` never fill the user's notes.
3. **Genres from Discogs (genres/styles) and MusicBrainz (genre tags)** are never stored. They are only an input to suggestions mapped onto Shelvio's controlled lists, and the item stores Shelvio genre IDs only. The mapping mechanism belongs to [Genre lists and mapping](06-genre-lists.md).
4. **Google Books**: prefill factual fields only (title, subtitle, creators, publisher, year, page count, ISBN, language) plus `google_books_volume_id`. No description, no cover.
5. **Covers**: Open Library and Cover Art Archive covers may be copied into R2 and resized (one per user-added item, never bulk). Discogs and Google images are shown live in the candidate picker only and never stored. If none of the permitted sources has a cover, the item is saved without one and the display fallback applies (user photo, then placeholder). Mechanics belong to [Covers, photos and thumbnails](11-covers-photos-thumbnails.md).
6. **Picker attribution**: Google results show the "powered by Google" logo and a link to the book's Google Books page. Discogs results show "Data provided by Discogs." linked to the release page (no `nofollow`).
7. **Item page attribution**: a quiet line "Źródła: Open Library · Discogs · MusicBrainz · Google Books". Each entry is a link derived from the item's stored external IDs, and only present IDs are shown. The Discogs entry reads "Dane z Discogs". No new "metadata source" field in the data model. Items entered by hand with no external IDs show no line.
8. **"O aplikacji" page**: static and public (no sign-in needed), linked from the account area of the sidebar and from a small link under the sign-in card. It contains the Discogs non-affiliation notice ("This application uses Discogs' API but is not affiliated with, sponsored or endorsed by Discogs. 'Discogs' is a trademark of Zink Media, LLC."), credits to Open Library, MusicBrainz (noting genre associations are CC BY-NC-SA), Cover Art Archive and Google Books, and a contact address for rights holders (Google Books terms require handling takedown requests). The address itself is chosen at deployment.

The UI brief (`ui/ui-brief.md`, sections 3.3, 3.4 and 3.7) was updated with items 6 to 8.

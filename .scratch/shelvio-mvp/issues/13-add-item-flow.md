# Add-item flow

Type: grilling
Status: resolved
Blocked by: 05, 06, 12, 18, 19
Map: [Shelvio MVP](../map.md)

## Question

What does adding an item look like from start to save?

Decide:
- the entry points (scan, search external API, manual) and which is the default on phone vs. desktop,
- how API results prefill the form and what the user must confirm (item type, genres mapped per Genre lists and mapping, shelf, ownership status),
- choosing between several matches (e.g. vinyl pressings),
- what happens when nothing is found (fall back to manual with the scanned code kept),
- whether to warn about a possible duplicate already in the collection.

## Comments

**2026-11-20, input from [UI brief and theme](20-ui-brief-and-theme.md).** The UI session answered most of this question; see `ui/ui-brief.md`, section 3.4 and 3.5. In short:
- **Entry points**: one "Dodaj pozycję" page with tabs Szukaj / Skanuj / Ręcznie; Szukaj is the default on desktop, Skanuj on mobile. A "Do kolekcji" select is preselected from context and lists only collections where the user is Owner or Contributor.
- **Search**: type toggle (Książka / Winyl) and one input for ISBN, EAN, title or artist. Candidates list on the left, a preview of the selected candidate on the right (a separate screen on mobile). Vinyl candidates show label + catalogue number, country and format so pressings can be told apart.
- **Prefill and confirm**: the preview offers the shelf (select, "Bez półki", "+ Nowa półka") and Mam / Chcę mieć, then "Zapisz", or "Edytuj szczegóły" for the full form. Genres from the lookup are preselected and marked "sugerowany".
- **Scan**: a single match shows a "Rozpoznano" card; several matches show the candidate list; after saving, the snackbar offers "Skanuj następny".
- **Nothing found**: "Nie znaleźliśmy tej pozycji" with "Dodaj ręcznie" (the manual form opens with the type and the code kept) and "Skanuj ponownie".
- **Duplicates**: a soft amber notice "Masz już tę pozycję w kolekcji …" with a link when the same ISBN or release exists in a visible collection; saving is still allowed.

Still open here: what the blockers decide (genre mapping, licensing, Polish coverage, the phone test), then close this ticket.

**2026-11-20, input from [Third-party data licensing and attribution](19-third-party-data-licensing.md)** (ADR-0004). The lookup is a one-time prefill: on save, values are copied and never refreshed; no raw responses are stored beyond a few minutes' cache. Copy only Discogs CC0 fields plus country (never Discogs notes) and only factual Google Books fields plus the volume ID. Source genres only seed the "sugerowany" genre suggestions. Picker attribution ("powered by Google", "Data provided by Discogs.") is now in `ui/ui-brief.md` section 3.4.

**2026-11-20, input from [Genre lists and mapping](06-genre-lists.md).** Suggested genres come from an in-code mapping table per metadata source (exact names for Discogs/MusicBrainz, keyword rules for Open Library/Google free text); a deciding Discogs style replaces the broad genre. Unmatched values are dropped. An item may be saved with no genre.

**2026-11-20, input from [Polish book coverage](18-polish-book-coverage.md).** For book lookups, the Polish National Library (`data.bn.org.pl`, CC0) comes first for `978-83`/`83` ISBNs, then e-ISBN, then Open Library. Other ISBNs go to Open Library first, then BN. Google Books is dropped from the MVP. Things that affect this flow:
- **Several matches.** BN can return more than one record for one ISBN (e.g. the 2022 and 2023 printings), so book search also needs the candidate list.
- **Covers.** BN has no covers. Fetch the cover separately (e-ISBN, else Open Library), so many Polish books will be saved with no cover and fall back to the user's photo.
- **ISBN input.** Normalise ISBN input (strip hyphens, validate the checksum, convert ISBN-10 for e-ISBN), because BN and e-ISBN return nothing for hyphenated ISBNs.
- **Nothing found.** Expect "Nie znaleźliśmy tej pozycji" mostly for e-books and audiobooks from platforms (e.g. Empik Go).
- **Attribution.** If Google is dropped, the picker needs no "powered by Google" logo.

**2026-11-20, input from [Covers, photos and thumbnails](11-covers-photos-thumbnails.md).** The cover is copied into storage on save, best-effort (~10 s timeout, no retry; on failure the item is saved without a cover). Book covers come from e-ISBN, else Open Library; vinyl covers from Cover Art Archive. A photo picked in the add form is uploaded before the item exists and linked on save. The browser downscales photos to ~2400 px before upload; limit 10 MB, JPEG/PNG/WebP.

**2026-11-20, Google Books measured (addendum to [Polish book coverage](18-polish-book-coverage.md)).** With a key, Google found 20/20 of the ticket sample and the Empik Go title BN + e-ISBN missed, but Polish records have no publisher and sometimes lose diacritics; covers cannot be stored. Decide here: keep Google as a last fallback (BN → e-ISBN → OL → Google → manual, with "powered by Google" attribution in the picker) or drop it. ADR-0004 and the Metadata source glossary entry follow that decision.

**2026-11-20, user decision: Google Books is dropped from the MVP.** Book lookup order: Polish ISBNs (`978-83`, `83`) BN → e-ISBN → Open Library → manual; other ISBNs Open Library → BN → manual. Reasons: Google's only unique find was an e-book (Shelvio tracks physical items), its Polish records are thinner than BN's, and another source costs an adapter, a secret and picker attribution for ~5% of cases. Reversible later through the metadata-source adapter seam. Still to do when this ticket is worked: amend ADR-0004 (add BN and e-ISBN, remove Google), update the Metadata source glossary entry, and drop "powered by Google" from the UI brief (picker attribution, "Źródła", "O aplikacji").

**2026-11-20, input from [Barcode scan prototype](12-barcode-scan-prototype.md).** Book scanning on an Android phone was fast (0.2–3.4 s to detect, BN hit on first step) and the user rated it good. Unwrapped vinyl has no barcode, so for vinyl scanning is secondary and search (artist/title **and catalogue number**) is the main path; decide whether the mobile default tab depends on the item type. No cover was found for any of the 3 scanned Polish books and the cover search took ~1.8 s, so show the candidate as soon as metadata arrives and fill the cover in afterwards. iOS/WASM untested on a device.

**2026-11-20, user agreed: mobile default tab.** The default tab does not depend on item type (the type is unknown when the page opens). On mobile: Skanuj on first use, then the device remembers the last-used tab; the scan screen has a prominent "Brak kodu? Wyszukaj" button that opens Szukaj with the type set to Winyl; opening "Dodaj pozycję" from a view filtered to vinyl opens Szukaj with Winyl preselected. Desktop stays on Szukaj. Record this when the ticket is resolved (and update `ui/ui-brief.md` section 3.4).

## Answer

Resolved 2026-11-20 (grilling with the user). The screens, entry points, preview, scan results, "not found" state and duplicate notice are in `ui/ui-brief.md` 3.4/3.5 (see the first comment); the decisions below complete them.

**Entry points and default tab.** One "Dodaj pozycję" page with tabs Szukaj / Skanuj / Ręcznie. Desktop opens on Szukaj. Mobile opens on Skanuj the first time, then the device remembers the last-used tab; the scan screen has a prominent "Brak kodu? Wyszukaj" button (opens Szukaj with Winyl set); opening the page from a view filtered to vinyl opens Szukaj with Winyl preselected. The default does not depend on item type.

**Book lookup.**
- ISBN input is normalised first: strip hyphens/spaces, validate the checksum, convert ISBN-10 to ISBN-13.
- ISBN routing: `978-83` / `83` → BN → e-ISBN → Open Library → manual; other ISBNs → Open Library → BN → manual. Google Books is not used in the MVP.
- The chain stops at the first source with a hit; if it returns several records (e.g. two printings), all are candidates. Fields from different sources are never merged into one candidate.
- Title/author text: BN and Open Library are queried in parallel; one list, BN results first and Polish editions first within them, results with the same ISBN collapsed; at most 20 per source, no pagination (the user refines the query).

**Vinyl lookup.**
- Digits only (12–13): barcode search in Discogs (`type=release&format=Vinyl`), exact digit match on our side. Any other text: Discogs `q` (artist, title or catalogue number), releases on vinyl only.
- MusicBrainz is used only when Discogs returns nothing or fails.
- Pressings sorted by Discogs community "have" count, at most 25; no grouping under the master in the MVP.

**Scanning.** The scan tab has no type toggle: EAN-13 starting 978/979 runs the book chain, any other EAN/UPC the vinyl chain. A code matching neither (e.g. a CD) ends in "Nie znaleźliśmy tej pozycji".

**Source failures.** A source that errors or is rate-limited is skipped and the chain continues. If every source fails, a separate state "Wyszukiwanie jest chwilowo niedostępne" offers "Spróbuj ponownie" and "Dodaj ręcznie" (code kept); a failure never shows as "not found".

**Covers in the flow.** Candidates appear as soon as metadata arrives; the cover is fetched separately (e-ISBN, else Open Library for books; Cover Art Archive for vinyl) with a placeholder until then. If the user saves first, the backend still tries to copy the cover on save (per Covers, photos and thumbnails).

**Preview defaults.** Ownership status defaults to Mam, or Chcę mieć when the page is opened from the wishlist / wanted filter. Shelf comes from the active shelf filter, else "Bez półki". Suggested genres show in the preview as "sugerowany" chips with ✕; "Zapisz" confirms them, so "Edytuj szczegóły" is not required.

**Duplicate warning.** Matched on identifiers only: ISBN-13 for books, Discogs or MusicBrainz release ID for vinyl (not titles, not the vinyl barcode, which represses share). Checked only in collections where the user is Owner or Contributor. A match with a wanted item reads "Ta pozycja jest na liście życzeń w kolekcji …" with "Zobacz" (the item page offers "Mam to"). The same check runs in the full form once an ISBN is entered. Never blocks saving.

**Creators on save.** Match by creator external ID (Open Library author key, Discogs artist ID, MusicBrainz artist ID), then by exact name ignoring case and diacritics; BN's inverted names ("Tokarczuk, Olga") become name "Olga Tokarczuk" and sort name "Tokarczuk, Olga". No match → a new creator is created silently. Normalisation, ID-conflict rules and merging: see [Creator duplicates and corrections](26-creator-duplicates.md).

**After saving.** From a scan: snackbar "Dodano do kolekcji …" with "Skanuj następny". From Szukaj or Ręcznie: the user stays on "Dodaj pozycję" with the search cleared or the form empty, type and collection kept, and a snackbar "Dodano do kolekcji …" with "Zobacz" (the item page).

**Follow-ups applied.** ADR-0004 amended (BN and e-ISBN added, Google Books removed); GLOSSARY "Metadata source" updated; `ui/ui-brief.md` 3.4 updated (default tab, source labels, attribution, failure state, after-save) and Google Books removed from "Źródła" and "O aplikacji".

**Consequence for Data model for item types.** `google_books_volume_id` on book details is no longer filled; replace it with `bn_record_id` (BN record number, used for the "Źródła" link). e-ISBN has no public record page, so it needs no ID column.

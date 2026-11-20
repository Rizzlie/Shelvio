# Barcode scan prototype

Type: prototype
Status: resolved
Blocked by: 01, 02, 03
Map: [Shelvio MVP](../map.md)

## Question

Does scanning a barcode in a phone browser and looking it up feel fast and reliable enough to be a main way of adding items?

Build a throwaway page with the library recommended in Browser barcode scanning: scan a real book (ISBN) and a real vinyl record (EAN/UPC), call the APIs chosen in Book metadata API and Vinyl metadata API, and show the candidates. Try it on the user's phone (and iOS Safari if available). Check how often a vinyl barcode matches several pressings and how picking one feels.

## Comments

**2026-11-20, unblocked from [API credentials for metadata lookups](17-api-credentials.md).** The user creates the keys only when implementation starts. Use keyless access instead: Open Library and Google Books (no key, low quota) for books; Discogs unauthenticated (25 req/min) while it still works before 2026-12-01, otherwise MusicBrainz for vinyl.

**2026-11-20, prototype built (session claimed this ticket).** Asset: [`prototypes/barcode-scan-PROTOTYPE/`](../prototypes/barcode-scan-PROTOTYPE/) — `server.mjs` (no-dependency Node proxy: BN → e-ISBN → Open Library for Polish ISBNs, Open Library → BN otherwise, cover from e-ISBN/OL; Discogs → MusicBrainz for vinyl, cover from CAA) and `index.html` (native `BarcodeDetector` or `barcode-detector` 3.2.4 ZXing WASM ponyfill, EAN checksum + two-frame confirmation, still-photo and manual fallbacks, per-step timings, candidate picker, rating buttons). Ratings go to `scan-log.PROTOTYPE.jsonl` next to the server. Smoke test from desktop: BN ~170 ms, e-ISBN cover ~0.8 s, Discogs ~300 ms, CAA cover ~280 ms; the Daft Punk RAM barcode `888837168618` returns **10 Discogs pressings**. Facts found on the way: Discogs barcode search still works keyless today; MusicBrainz answers 503 to back-to-back calls (needs the ~1 req/s queue); e-ISBN `<Product>` carries attributes. Waiting on the user's phone test to resolve.

## Answer

**Yes for books, no for vinyl.** Scanning is a main way to add books on a phone; for vinyl it is a secondary path, and search is the main one.

Evidence (phone test 2026-11-20, raw log in [`scan-log.PROTOTYPE.jsonl`](../prototypes/barcode-scan-PROTOTYPE/scan-log.PROTOTYPE.jsonl)):
- **Device:** Android 10, Samsung Internet 31 (Chromium 148). The native `BarcodeDetector` was available and used, so the ZXing WASM path and iOS Safari were not tested on a device.
- **Books:** 3 Polish books, all rated "szybko" by the user. Detection took 0.24 s, 0.85 s and 3.4 s from camera ready (2 to 39 frames); the checksum + two-frame confirmation gave no misreads. Each was found in BN on the first step (120–180 ms server-side).
- **Covers:** none of the 3 got a cover from e-ISBN or Open Library, and the cover search took ~1.8 s of the ~3 s total (the rest is the tunnel). So the result must render as soon as the metadata source answers, with the cover filled in later (or not at all) rather than awaited.
- **Vinyl:** not scanned, because the user's records have no barcode once unwrapped (it was on the shrink-wrap sticker). Scanning a record only works for sealed or new ones. The desktop smoke test showed a single barcode can match many pressings (10 Discogs releases for `888837168618`), so the candidate list with label, catalogue number, country and format from the UI brief is needed whatever the entry point; picking among them was not tried on a phone.

Consequences for [Add-item flow](13-add-item-flow.md):
- The default tab on mobile should depend on the item type (Skanuj for books, Szukaj for vinyl), or stay Szukaj with scanning one tap away; decide there.
- Vinyl search must accept a catalogue number (usually printed on the spine or label) as well as artist/title.
- Library choice from [Browser barcode scanning](03-browser-barcode-scanning.md) stands: native where available, `barcode-detector` ponyfill otherwise. iOS stays unverified; the still-photo fallback and manual code entry remain.

Prototype (asset, throwaway, kept out of the app): [`prototypes/barcode-scan-PROTOTYPE/`](../prototypes/barcode-scan-PROTOTYPE/).

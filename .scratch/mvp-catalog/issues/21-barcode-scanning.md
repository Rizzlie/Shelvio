# 21: Barcode scanning

**What to build:** On a phone the Owner opens the "Skanuj" tab, points the camera at a barcode, and the code alone decides whether a book or vinyl lookup runs; one match shows a "Rozpoznano" card, several show the candidate list, none shows "Nie znaleźliśmy tej pozycji"; after saving, "Skanuj następny" starts again. See the spec's "Frontend" (scanner, "Dodaj pozycję" default tab), map tickets 03, 12 and 13 and UI brief 3.4.

**Blocked by:** 11 (Lookup tracer: Szukaj with fake sources).

**Status:** ready-for-agent

- [ ] Frontend `BarcodeSource` seam. Camera implementation: `getUserMedia` with `facingMode: environment`, `<video playsinline muted autoplay>`; native `BarcodeDetector` when `getSupportedFormats()` includes `ean_13`, otherwise the `barcode-detector` ponyfill with the self-hosted, lazy-loaded ZXing WASM; formats EAN-13, UPC-A, EAN-8, UPC-E; the scanner lazy-loaded.
- [ ] Pure confirmation function (valid check digit and the same value on two consecutive frames) and pure classifier (978, or 979 but not 9790 → book; else vinyl) with unit tests.
- [ ] Skanuj tab: viewfinder with aiming frame, hint "Nakieruj aparat na kod kreskowy", torch toggle only when supported, prominent "Brak kodu? Wyszukaj" opening Szukaj with Winyl, still-photo fallback decoding one picture with the same detector; camera refused or missing → a message with a way to Szukaj.
- [ ] Results: one match → "Rozpoznano" card with the code, summary and "Wybierz tę pozycję" (→ preview); several → candidate list; none → only "Nie znaleźliśmy tej pozycji" with "Możesz dodać ją ręcznie", "Dodaj ręcznie" (type and code filled) and "Skanuj ponownie"; all sources failing → the unavailable state.
- [ ] After saving from a scan: snackbar "Dodano do kolekcji …" with "Skanuj następny".
- [ ] Default tab: desktop Szukaj; mobile Skanuj the first time, then the last-used tab from `localStorage` (try/catch, falling back to Skanuj); a vinyl context opens Szukaj with Winyl. Pure default-tab logic with unit tests, including blocked storage.
- [ ] An e2e-only build configuration replaces the camera implementation with one Playwright drives; the production build contains none of it.
- [ ] Decoder unit test: the ponyfill decodes static images of EAN-13 (book and vinyl codes) and UPC-A, generated plus a few real photos.
- [ ] E2E through the e2e code source: one match, several matches, no match, "Skanuj następny".
- [ ] Manual check documented in the ticket's comments when done: Android phone over HTTPS (native vs ponyfill, `playsinline`, torch, still photo, permission refusal), and iOS Safari if available.

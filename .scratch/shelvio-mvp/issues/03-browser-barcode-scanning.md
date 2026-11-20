# Browser barcode scanning

Type: research
Status: resolved
Blocked by: none
Map: [Shelvio MVP](../map.md)

## Question

How can a phone **browser** scan barcodes through the camera in an Angular app?

Find out:
- native `BarcodeDetector` API support (Chrome Android, iOS Safari, Firefox),
- maintained JS libraries (e.g. `@zxing/browser`, `html5-qrcode`, `quagga2`, `zxing-wasm`): which formats they read (EAN-13, UPC-A, ISBN as EAN-13 978/979), accuracy, bundle size, licence, maintenance status,
- camera permission and HTTPS requirements, iOS Safari quirks (autofocus, PWA vs. browser tab),
- whether an EAN on a book is always convertible to an ISBN-13.

Recommend a library or approach for the prototype.

## Answer

Use the `barcode-detector` package (MIT, actively maintained; a ZXing-C++ WebAssembly ponyfill of the standard `BarcodeDetector` API). Use the native `BarcodeDetector` only on Chrome Android, where it exists; iOS Safari and Firefox have no usable native API.
Restrict detection to EAN-13/UPC-A/EAN-8/UPC-E, self-host and lazy-load the ~1 MiB `.wasm` file, validate the check digit, and confirm the same value across 2 frames. Always offer manual entry and a still-photo fallback.
Camera access requires HTTPS (including on LAN test phones) and `<video playsinline muted>`. Prefer the iOS browser tab over the home-screen PWA, which has permission re-prompt bugs.
Avoid `html5-qrcode` (unmaintained since 2023); `@zxing/*` is in maintenance mode.
An EAN-13 starting 978 or 979 (excluding 9790, which is ISMN) is the ISBN-13 itself. Other barcodes on books (977 ISSN, UPC) are not ISBNs.
Details: [research/browser-barcode-scanning.md](../research/browser-barcode-scanning.md)

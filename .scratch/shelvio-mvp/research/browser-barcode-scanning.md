# Browser barcode scanning

Research for ticket [03 Browser barcode scanning](../issues/03-browser-barcode-scanning.md). Checked on 2026-11-18. Package versions and repo activity come from the npm registry (`https://registry.npmjs.org/<pkg>`) and the GitHub REST API (`https://api.github.com/repos/<owner>/<repo>`), both queried on that date.

## Recommendation

**For the prototype, use the [`barcode-detector`](https://github.com/Sec-ant/barcode-detector) package in ponyfill mode.** It implements the standard `BarcodeDetector` interface on top of ZXing-C++ compiled to WebAssembly (`zxing-wasm`). Wrap it in a small Angular service that owns the `getUserMedia` stream and runs a `requestAnimationFrame` detect loop.

- **Engine choice:** use the native `BarcodeDetector` only when it exists and `getSupportedFormats()` includes `ean_13` (Chrome on Android with Google Play Services). Use the ponyfill everywhere else: iOS Safari, every other iOS browser, Firefox, and desktop. Because both share one API, the app code is the same either way.
- **Formats:** limit detection to `ean_13`, `upc_a`, `ean_8` and `upc_e`. That covers books (Bookland EAN-13) and records (UPC-A/EAN-13). Fewer formats means faster decoding and fewer misreads.
- **Self-host the `.wasm` file.** By default it is fetched from jsDelivr. Copy it into the Angular assets and point `prepareZXingModule({ overrides: { locateFile } })` at it. The reader binary is about 1.04 MiB, so lazy-load the scanner route or component.
- **Accept a scan only after it is confirmed:** check the EAN-13 check digit, then require the same value on two consecutive frames. Always offer **manual ISBN/barcode entry** as a fallback. Optionally add `<input type="file" accept="image/*" capture="environment">` and decode the still photo with the same detector, for devices where live focus is poor.
- **Treat EAN-13 values starting 978/979 as ISBN-13, except 9790** (that range is ISMN, for sheet music). The digits are identical, so no conversion is needed. Other EANs on books (977 ISSN, UPC, retailer labels) are not ISBNs and should go to a generic barcode lookup or manual entry.
- **Serve over HTTPS on every device you test**, including phones on the LAN (for example `nx serve --ssl` or a tunnel). Use `<video playsinline muted autoplay>`. Test the iOS **browser tab** first; installed home-screen (PWA) mode on iOS has known camera-permission re-prompt problems.

**Rejected alternatives:**
- **`html5-qrcode`:** the author declared maintenance mode, the last release was in April 2023, and 453 issues are open.
- **`@zxing/browser` / `@zxing/ngx-scanner`:** a convenient ready-made Angular component, but the underlying `@zxing/library` is officially "maintenance mode only", and its JS bundle is about 120 kB gzip. This is the fallback if WASM causes trouble.
- **`@ericblade/quagga2`:** actively maintained, MIT-licensed and 1D-only. Its localisation and decoding is a pure JS pipeline that predates ZXing-C++. It is a reasonable second choice but has no clear advantage.

## 1. Native `BarcodeDetector` API

| Browser | Status | Source |
|---|---|---|
| Chrome Android | Supported since 83 | [MDN BCD `api/BarcodeDetector.json`](https://github.com/mdn/browser-compat-data/blob/main/api/BarcodeDetector.json) |
| Chrome desktop | Partial: macOS and ChromeOS only | same |
| Safari macOS / iOS (and iOS WebView) | Since 17, **only behind the "Shape Detection API" preference flag**, so it is off for real users | same |
| Firefox (desktop and Android) | Not implemented ([bug 1553738](https://bugzil.la/1553738)) | same |

- The API is experimental, available only in secure contexts, and available in Web Workers. ([MDN Barcode Detection API](https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API))
- The spec's formats include `ean_13`, `ean_8`, `upc_a`, `upc_e`, `code_128`, `qr_code` and others. Each platform supports a subset, so call `BarcodeDetector.getSupportedFormats()` at runtime. ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API))
- Chrome says barcode detection exists on macOS, ChromeOS and Android, and that "Google Play Services are required on Android". Checking that the constructor exists "doesn't suffice" as feature detection. ([Chrome for Developers: Shape Detection API](https://developer.chrome.com/docs/capabilities/shape-detection))
- Every browser on iOS is built on WebKit (except under the EU alternative-engine entitlement), so Chrome and Firefox on iOS do not get the API either. ([Apple App Review Guidelines 2.5.6](https://developer.apple.com/app-store/review/guidelines/#software-requirements); the [html5-qrcode README](https://github.com/mebjas/html5-qrcode#ios) also notes that iOS browsers share WebKit)

**Conclusion:** the native API alone cannot be relied on, because it is missing for iPhone users and Firefox users. A WASM or JS decoder is required.

## 2. Libraries compared

Bundle sizes are from the Bundlephobia API (`https://bundlephobia.com/api/size?package=<pkg>`, minified / gzip, JS only). The WASM binaries are listed separately.

| Package | Latest (date) | Licence | Engine | JS size min / gz | Repo activity |
|---|---|---|---|---|---|
| [`barcode-detector`](https://www.npmjs.com/package/barcode-detector) | 3.2.4 (2026-11-15) | MIT | `zxing-wasm` (ZXing-C++) | 42.8 kB / 14.6 kB + reader WASM ~1.04 MiB | pushed 2026-11-15, 1 open issue, 243 stars ([repo](https://github.com/Sec-ant/barcode-detector)) |
| [`zxing-wasm`](https://www.npmjs.com/package/zxing-wasm) | 3.1.7 (2026-11-15) | MIT (wrapper); ZXing-C++ itself is Apache-2.0 | ZXing-C++ | 40.2 kB / 14.1 kB + WASM (reader ~1.04 MiB, full ~1.46 MiB) | pushed 2026-11-15, 3 open issues ([repo](https://github.com/Sec-ant/zxing-wasm)) |
| [`@zxing/browser`](https://www.npmjs.com/package/@zxing/browser) + [`@zxing/library`](https://www.npmjs.com/package/@zxing/library) | 0.2.1 (2026-07-06) / 0.23.0 (2026-04-29) | MIT / Apache-2.0 | ZXing Java port in TypeScript | 27.3 kB / 7.0 kB + 456 kB / 120 kB | library: 190 open issues, **"Project in Maintenance Mode Only"** ([README](https://github.com/zxing-js/library#project-in-maintenance-mode-only)) |
| [`@zxing/ngx-scanner`](https://www.npmjs.com/package/@zxing/ngx-scanner) | 22.0.1 (2026-07-02), peer `@angular/core ^22` | MIT | `@zxing/browser` | (as above) | 89 open issues ([repo](https://github.com/zxing-js/ngx-scanner)) |
| [`html5-qrcode`](https://www.npmjs.com/package/html5-qrcode) | 2.3.8 (**2023-04-15**) | Apache-2.0 | bundles `@zxing/library`, optional native `BarcodeDetector` | 370 kB / 107 kB | 453 open issues; **"in maintenance mode until further notice… Pull requests also won't be merged"** ([README](https://github.com/mebjas/html5-qrcode)) |
| [`@ericblade/quagga2`](https://www.npmjs.com/package/@ericblade/quagga2) | 1.13.0 (2026-10-21) | MIT | pure JS 1D locator + decoders | 154 kB / 42.7 kB | pushed 2026-11-04, 68 open issues ([repo](https://github.com/ericblade/quagga2)) |

### Formats

- **zxing-wasm / barcode-detector** can read EAN-13, EAN-8, UPC-A, UPC-E and an explicit `ISBN` format. EAN-5 and EAN-2 add-ons can only be written, not read. ([zxing-wasm README](https://github.com/Sec-ant/zxing-wasm#supported-barcode-formats), [barcode-detector README](https://github.com/Sec-ant/barcode-detector))
  - The format names follow the `BarcodeDetector` naming: `ean_13`, `upc_a`, `isbn`, `ean_upc` and so on.
  - The `.wasm` URL defaults to jsDelivr. You can override it with `prepareZXingModule` / `locateFile` to self-host it. ([zxing-wasm README](https://github.com/Sec-ant/zxing-wasm))
- **ZXing-C++** was ported from Java ZXing but "has been developed further and now includes many improvements in terms of runtime and detection performance". ([zxing-cpp README](https://github.com/zxing-cpp/zxing-cpp))
- **@zxing/library** reads UPC-A, UPC-E, EAN-8, EAN-13, Code 39/93/128, ITF, QR, Data Matrix and others. ([README](https://github.com/zxing-js/library#supported-formats))
- **html5-qrcode** reads EAN-13, EAN-8, UPC-A and UPC-E through zxing-js. ([README](https://github.com/mebjas/html5-qrcode#supported-code-formats))
- **quagga2** reads 1D codes only: EAN, EAN-8, UPC-A, UPC-E, Code 128/39 and others. It needs an external reader plugin for QR. Its README warns that more decoders slow things down and can mix up EAN-13 and UPC-A, so define the decoder set explicitly. ([quagga2 README](https://github.com/ericblade/quagga2))

### Accuracy

I found no independent, current benchmark that compares these libraries from a primary source. Treat accuracy as something the prototype (ticket 12) must measure on real devices. The evidence available:

- **ZXing-C++** says it improved detection performance over the Java original. ([zxing-cpp README](https://github.com/zxing-cpp/zxing-cpp))
- **zxing-js** has open reports about 1D decoding, both of them unresolved:
  - UPC-A decoded incorrectly ([#88](https://github.com/zxing-js/library/issues/88))
  - 1D barcode scans when moving to the left ([#425](https://github.com/zxing-js/library/issues/425))
- **quagga2** has open locator-quality work, including per-patch thresholding ([PR #701](https://github.com/ericblade/quagga2/pull/701)), and an open issue with mobile camera width/height constraints ([#488](https://github.com/ericblade/quagga2/issues/488)).
- **Whatever the library, use two safeguards:** an EAN check-digit validation, and a confirmation across several frames.

## 3. Camera access, HTTPS and permissions

- `getUserMedia()` works only in secure contexts: HTTPS, `file://` or `localhost`. In an insecure context `navigator.mediaDevices` is `undefined`. ([MDN getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia))
  - Practical consequence: a phone that opens `http://192.168.x.x:4200` gets no camera.
- User permission is always required. Only the top-level document may request it, unless an `<iframe>` is granted `allow="camera"` through Permissions Policy. ([MDN getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia))
- Use `facingMode: "environment"` to prefer the rear camera, or `{ exact: "environment" }` to require it. ([MDN getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia))

## 4. iOS Safari quirks

- **Inline video:** on iPhone, `<video>` plays inline only with `playsinline`. Muted video, or video without audio, may `autoplay` without a user gesture. ([WebKit blog: New video policies for iOS](https://webkit.org/blog/6784/new-video-policies-for-ios/))
- **Lens selection and close focus:**
  - Since iOS 16.4, `facingMode: 'environment'` can select a virtual multi-lens camera at its widest field of view. ([WebKit bug 253186](https://bugs.webkit.org/show_bug.cgi?id=253186))
  - On iPhone 13/14 Pro the main lens has a long minimum focus distance. Reporters ask for an opt-in "auto macro" mode specifically for close-range barcode scanning.
  - The bug is marked fixed on trunk, but a reporter said the shipping 16.4 release still showed the problem.
  - Web apps cannot pick a physical lens. iOS may switch lenses mid-stream on Pro models. ([Apple Developer Forums thread 776460](https://developer.apple.com/forums/thread/776460), unanswered)
  - **Practical consequence:** in the UI, ask users to hold the book about 15–20 cm away rather than very close, and offer the still-photo fallback.
- **Focus, torch and zoom control:**
  - BCD lists `ImageCapture` in Safari from 18.4 ([BCD `api/ImageCapture.json`](https://github.com/mdn/browser-compat-data/blob/main/api/ImageCapture.json)).
  - Torch on iOS has a history of bugs. One example: `getSettings()` returns a stale torch value on iOS 18 ([WebKit bug 280970](https://bugs.webkit.org/show_bug.cgi?id=280970)).
  - quagga2 documents that torch "does not work on iOS devices of at least version 16.4 and earlier" ([quagga2 README](https://github.com/ericblade/quagga2)).
  - **Conclusion:** do not depend on focus, torch or zoom constraints on iOS. Treat them as progressive enhancement.
- **Browser tab vs. home-screen PWA:**
  - `getUserMedia` did not work in standalone home-screen apps until iOS 13.4. ([WebKit bug 185448](https://bugs.webkit.org/show_bug.cgi?id=185448))
  - In standalone mode, iOS has re-prompted for camera permission. Reported triggers include hash changes, and permission has not persisted across app launches. ([WebKit bug 215884](https://bugs.webkit.org/show_bug.cgi?id=215884), [WebKit bug 212040](https://bugs.webkit.org/show_bug.cgi?id=212040))
  - Use the Angular router's default path-based (HTML5 history) location strategy, not hash routing. Expect a permission prompt on every PWA launch.

## 5. EAN-13 vs ISBN-13

- An ISBN-13 starts with a GS1 element "issued by GS1, currently 978 or 979". The ISBN "is already in 13-digit format and can be represented easily as a bar code". ([International ISBN Agency FAQ, 7th ed. manual](https://www.isbn-international.org/sites/default/files/ISBN_FAQs_to_7ed_Manual_Absolutely_final.docx))
- The ISBN-13 is "exactly equivalent to the Bookland EAN". Prefixes 978 and 979 are reserved to encode the ISBN. "There is no 10-digit ISBN equivalent for Bookland EANs beginning with '979'." ([BISG Barcoding Guidelines](https://www.bisg.org/barcoding-guidelines-for-the-us-book-industry))
  - So the scanned EAN-13 *is* the ISBN-13 and needs no conversion. An ISBN-10 can be derived only for 978.
- **Not every 978/979 EAN is an ISBN.** The 9790 subset belongs to the International ISMN Agency for notated music. ([GS1 Company Prefix analysis](https://www.gs1.org/docs/architecture/RFF_Company_Prefix_i1.1_2015-09-16.pdf); [ISMN Users' Manual](https://ismn-international.org/?p=1136): prefix "Always 979-0")
- **Not every barcode on a book is an ISBN:**
  - Serials and magazines use GS1 prefix 977 (an ISSN without its check digit). ([GS1 General Specifications](https://ref.gs1.org/standards/genspecs/25.0.0/), [GS1 prefix analysis](https://www.gs1.org/docs/architecture/RFF_Company_Prefix_i1.1_2015-09-16.pdf))
  - US publishers historically printed UPCs instead of or alongside Bookland EAN, for example on mass-market paperbacks. The practice has been phased out, but older books in a collection may still carry one. ([BISG](https://www.bisg.org/barcoding-guidelines-for-the-us-book-industry))
  - Some book-like products (games, calendars, art prints) carry UPCs. ([BISG](https://www.bisg.org/barcoding-guidelines-for-the-us-book-industry))
  - Books from before ISBN existed, or without a barcode, need manual entry.
- **5-digit price add-on:** this optional symbol sits beside the EAN on some books. ([BISG](https://www.bisg.org/barcoding-guidelines-for-the-us-book-industry)) zxing-wasm does not read EAN-5/EAN-2 ([README](https://github.com/Sec-ant/zxing-wasm#supported-barcode-formats)), so it will not be mistaken for the ISBN.

**Classification rule for Shelvio:**
1. Validate the EAN-13 check digit.
2. If the code starts with `978`, or with `979` but not `9790`, treat it as ISBN-13 and send it to the book metadata lookup (ticket 01).
3. If it is UPC-A, or any other EAN-13, treat it as a generic GTIN. This is the normal case for vinyl, which goes to the vinyl lookup (ticket 02).
4. If nothing matches, fall back to manual entry.

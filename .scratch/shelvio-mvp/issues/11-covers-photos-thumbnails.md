# Covers, photos and thumbnails

Type: grilling
Status: resolved
Blocked by: 01, 02, 04, 19
Map: [Shelvio MVP](../map.md)

## Question

How does Shelvio store and serve images?

Agreed: one user photo per item in the MVP; thumbnails are scaled and cached.

Decide, within what the provider terms (Book metadata API, Vinyl metadata API) and hosting (Hosting and file storage) allow:
- whether API covers are copied into our storage or hotlinked,
- thumbnail sizes and formats (e.g. WebP/AVIF), generated on upload or on the fly,
- cache headers and CDN,
- upload limits (size, type), and stripping EXIF/location data from user photos,
- which image is shown when an item has both a cover and a user photo.

Input from Data model for item types: items and collections are soft-deleted and never purged in the MVP, so their files must survive the orphaned-file sweep.

## Comments

**2026-11-20, input from [UI brief and theme](20-ui-brief-and-theme.md).** UI decisions this ticket should build on:
- The cover from a metadata lookup is read-only in the UI; it cannot be hidden or replaced in the MVP.
- One optional user photo sits beside it (drag-and-drop or file picker; on mobile camera or gallery), with the hint "JPEG, PNG lub WebP, do 10 MB" (the limit itself is still this ticket's call).
- Display fallback everywhere: cover → user photo → placeholder with the item-type icon and title.
- Grid cards use a fixed cover area: books 2:3, vinyl 1:1, centered on a neutral background.
- The user photo is visible to everyone with access to the collection.

**2026-11-20, input from [Third-party data licensing and attribution](19-third-party-data-licensing.md)** (ADR-0004). Open Library and Cover Art Archive covers may be copied into R2 and resized, one per user-added item, never in bulk. Discogs and Google Books images are shown live in the candidate picker only and never stored or hotlinked from a saved item. If no permitted cover exists, the item has none and the fallback applies (user photo, then placeholder).

## Answer

Resolved 2026-11-20 (grilling). Glossary: **Cover** and **Photo** added. ADR: [0005 Public image URLs with unguessable keys](../../../docs/adr/0005-public-image-urls-with-unguessable-keys.md).

**Serving.** Public Cloudflare R2 bucket (EU jurisdiction) on `img.<domain>`, cached by Cloudflare's CDN; no signed URLs, no proxy through Nest. Each image has a fresh random, unguessable object key (not UUIDv7). Keys are immutable: replacing a photo creates a new key, never overwrites. Header `Cache-Control: public, max-age=31536000, immutable`. The domain's DNS lives on Cloudflare (Free): `img.` → R2, `app.` → Cloudflare Pages, `api.` → CNAME to Render. Cost $0 at this scale (R2 free tier, free egress, CDN on the Free plan). Storing files on the Render disk was rejected: ephemeral on Free, a paid persistent disk blocks zero-downtime deploys, and traffic would eat Render's 5 GB/month.

**Covers.** Copied, never hotlinked. On item save the backend fetches the permitted cover once, makes the variants and stores them in R2, best-effort with a ~10 s timeout and no retries; on failure the item is saved without a cover (it stays read-only, so the photo is the remedy). Permitted sources: books from e-ISBN (publisher covers, "informational" reuse, treated like Open Library; ADR-0004 to be amended), else Open Library; vinyl from Cover Art Archive. Discogs/Google images stay picker-only (ADR-0004).

**Variants.** Two, WebP only, generated synchronously on upload with `sharp`: `thumb` 480 px on the longer side (grid, list, "Mam to!" dialog) and `large` 1200 px (item detail). No AVIF (slow encoding on Render's CPU). The uploaded original is not kept.

**Uploads.** One photo per item, JPEG/PNG/WebP, max 10 MB, type checked by content (magic bytes), images over ~40 MP rejected (decompression bombs, 512 MB RAM). The browser downscales to ~2400 px before uploading. EXIF orientation is applied, then all metadata (GPS, camera, etc.) is stripped from every variant, covers included.

**Display.** Detail page shows cover and photo in `large`, no lightbox or click action. Elsewhere `thumb`, with the fallback cover → photo → placeholder (from the UI brief).

**Model and cleanup.** Table `images` (id, kind `cover`/`photo`, variant keys, width/height, `created_at`); `items.cover_image_id` and `items.photo_image_id`. A photo uploaded in the add form exists before the item and is linked on save; removing or replacing a photo only unlinks it. A daily sweep deletes images referenced by no item (soft-deleted items and collections count as references, ADR-0003) and older than 24 h, and R2 objects with no `images` row older than 24 h. Moving an item between collections does not touch its files.

**Local dev and tests.** R2 speaks S3, so one S3 adapter: `docker-compose` runs **MinIO** with a public-read bucket; the app switches only `S3_ENDPOINT` and `IMAGE_BASE_URL`. Unit and integration tests use the in-memory storage adapter; e2e uses MinIO.

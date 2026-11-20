# 09: Item photos

**What to build:** The Owner adds one photo of their copy to an item (in the add form before saving, or when editing), replaces or removes it, and sees it on the item page; everywhere else the picture falls back cover → photo → placeholder. See the spec's "Media", "Catalog: items" (`setPhoto`, `removePhoto`), "Data model" (`images`) and ADR-0005.

**Blocked by:** 03 (Edit and delete an item).

**Status:** ready-for-agent

- [ ] Media `domain` and `feature` libraries; `FileStorage` seam with an S3 adapter (MinIO locally and in e2e, R2 later) and an in-memory adapter for tests; objects written with `Cache-Control: public, max-age=31536000, immutable`; `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `IMAGE_BASE_URL` in the config schema and `.env.example`; `docker-compose` creates a public-read bucket.
- [ ] `images` table (kind, variant keys, sizes, `created_by_user_id`, `created_at`); `items.cover_image_id` and `items.photo_image_id` (unique where not NULL).
- [ ] `uploadPhoto` → `POST /images/photos` (multipart): over 10 MB rejected before buffering, type by magic bytes (JPEG/PNG/WebP), over ~40 MP refused (`image.tooLarge`, `image.unsupportedType`, `image.tooManyPixels`); EXIF orientation applied and all metadata stripped; `thumb` 480 px and `large` 1200 px WebP with `sharp`; fresh random keys (≥128 bits, never UUIDv7); original not kept.
- [ ] `createItem` accepts `photoImageId`; `setPhoto` / `removePhoto` (`PUT`/`DELETE /items/{id}/photo`) require `item:edit` and a photo image uploaded by the actor and not linked elsewhere (`image.notLinkable`); replacing only unlinks; bumps `updated_*`.
- [ ] The item contract returns `cover` and `photo` as `{ thumbUrl, largeUrl, width, height }` or null.
- [ ] Form section Zdjęcie: read-only "Okładka" slot, one photo slot with drag-and-drop or "Wybierz plik" (mobile "Zrób zdjęcie / wybierz z galerii"), hint "JPEG, PNG lub WebP, do 10 MB", browser downscale to ~2400 px before upload, preview with "Zmień" / "Usuń", translated errors.
- [ ] Item page shows cover then photo in `large`; one shared picture component (cover → photo → placeholder in the fixed 2:3 / 1:1 area, `thumb`) used by the temporary list and the "Mam to!" dialog.
- [ ] Domain tests (in-memory storage): limits, metadata stripped and orientation applied, two variants with expected sizes, distinct random keys, link rules, `updated_by` bump. HTTP test: a body over 10 MB is rejected.
- [ ] E2E (MinIO): upload in the add form and see the photo on the page and in the list; replace and remove it on edit.

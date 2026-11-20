# Public image URLs with unguessable keys

Covers and photos are served straight from a public Cloudflare R2 bucket on `img.<domain>`, cached by Cloudflare's CDN. Access is protected only by the object key: each image gets a fresh random key (not the time-ordered UUIDv7 used for rows), so a URL cannot be guessed, but anyone holding it can load the image. Keys are immutable (a replaced photo gets a new key) and served with `Cache-Control: public, max-age=31536000, immutable`. All metadata (EXIF, GPS) is stripped on upload, so a leaked URL reveals only the picture itself.

Consequence: a person who loses access to a collection can still open image URLs they saw before. This is accepted: covers are public anyway, and photos are pictures of physical copies, not sensitive data.

## Considered options

- **Signed, short-lived URLs**: rejected. Every read would mint URLs, and per-request signatures defeat CDN caching.
- **Proxy through Nest with a permission check**: rejected. Image traffic would use up Render's bandwidth allowance and wake the sleeping free instance; it is the one thing the hosting choice meant to avoid.

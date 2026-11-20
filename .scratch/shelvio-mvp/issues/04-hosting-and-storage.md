# Hosting and file storage

Type: research
Status: resolved
Blocked by: none
Map: [Shelvio MVP](../map.md)

## Question

Where should Shelvio run, at free or near-free cost, for tens of users and thousands of items?

Compare realistic options for:
- the **NestJS** backend (long-running Node process): e.g. Render, Railway, Fly.io, Google Cloud Run, a small VPS,
- the **Angular** frontend: static hosting (Cloudflare Pages, Netlify, Vercel, Firebase Hosting) or served by Nest,
- **PostgreSQL**: e.g. Neon, Supabase, managed DB on the backend host,
- **object storage + CDN** for covers, user photos and thumbnails: e.g. Cloudflare R2, Supabase Storage, S3-compatible options; image resizing (on upload vs. on the fly).

For each: free-tier limits, cold starts or sleep, region (EU), egress costs, and what happens when you exceed the limits. Recommend one combination.

## Answer

Run the NestJS API on Render's Free web service in Frankfurt. It spins down after 15 min idle and takes about 1 min to wake; upgrade to Starter at $7/mo to keep it always on.
Host the Angular build on Cloudflare Pages: static requests are free and unlimited.
Use Neon Free Postgres in AWS Frankfurt: 1 GB storage, scale-to-zero with sub-second resume, and nothing is deleted when limits are exceeded. Skip Render's free Postgres (expires after 30 days) and Supabase (pauses after 1 week idle).
Store covers and photos in a Cloudflare R2 bucket with the EU jurisdiction: 10 GB free, zero egress. Resize on upload in Nest (sharp) into fixed thumbnail sizes.
Expected cost: $0/mo for the MVP, about $7/mo once the API should never sleep. Fallback: a Hetzner CPX02 VPS at €5.49-6.49/mo excl. VAT.
Details: [research/hosting-and-storage.md](../research/hosting-and-storage.md)

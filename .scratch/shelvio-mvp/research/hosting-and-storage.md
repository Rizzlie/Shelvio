# Hosting and storage for Shelvio (free / near-free, EU)

Ticket: [04-hosting-and-storage](../issues/04-hosting-and-storage.md)
Sources checked: **2026-11-18**, official provider pricing and docs pages only. Free tiers change often, so re-check the linked pages before you sign up.

## Recommendation

| Layer | Pick | Region | Cost |
|---|---|---|---|
| NestJS API | **Render** Free web service, upgrading to Starter ($7/mo) when the cold starts get annoying | Frankfurt | $0 (later $7/mo) |
| Angular frontend | **Cloudflare Pages** (or Workers static assets) | global edge | $0 |
| PostgreSQL | **Neon** Free | AWS Frankfurt (`aws-eu-central-1`) | $0 |
| Covers/photos/thumbnails | **Cloudflare R2**, bucket with `eu` jurisdiction, public through a custom domain | EU | $0 |
| Image resizing | **On upload, in Nest** (e.g. `sharp`): store an original plus 1-2 fixed thumbnail sizes in R2. Cloudflare Images transformations are an optional extra (5,000 unique per month free). | — | $0 |

Why this combination:
- **Every part is $0 at Shelvio's scale, and no part deletes data on a timer.** Render's free Postgres expires after 30 days ([render.com/docs/free](https://render.com/docs/free)), so it is ruled out. Supabase free projects pause after 1 week of inactivity ([supabase.com/pricing](https://supabase.com/pricing)). Neon only suspends compute; it resumes "typically within a few hundred milliseconds" and over-limit usage never deletes data ([neon.com/pricing](https://neon.com/pricing)).
- **Image egress is free.** R2 has no egress charge ([R2 pricing](https://developers.cloudflare.com/r2/pricing/)), and static-asset requests on Pages are free and unlimited ([Pages Functions pricing](https://developers.cloudflare.com/pages/functions/pricing/)). That keeps image traffic away from Render's 5 GB/month bandwidth allowance ([render.com/docs/outbound-bandwidth](https://render.com/docs/outbound-bandwidth)).
- **Everything stays in the EU.** Render Frankfurt ([regions](https://render.com/docs/regions)), Neon Frankfurt ([regions](https://neon.com/docs/introduction/regions)), and R2 with the `eu` jurisdiction, which "guarantee[s] objects in a bucket are stored within" the EU ([R2 data location](https://developers.cloudflare.com/r2/reference/data-location/)).
- **Main trade-off:** Render Free spins down after 15 min without traffic and takes about 1 minute to start again ([render.com/docs/free](https://render.com/docs/free)). Accept that for the MVP, or pay **$7/mo** for Starter (512 MB, 0.5 CPU), which does not spin down ([render.com/pricing](https://render.com/pricing)). If a fixed price and full control matter more than managed services, the fallback is a **Hetzner CPX02** (1 vCPU, 1 GB RAM, 20 GB SSD, 20 TB traffic, €5.49/mo in Helsinki or €6.49/mo in Germany, excl. VAT) running Nest and Postgres yourself ([hetzner.com/cloud/regular-performance](https://www.hetzner.com/cloud/regular-performance)).

Expected cost: **$0/month** for the MVP. **About $7/month** once the API should never sleep. **About $0.015/GB-month** of R2 storage above 10 GB, which is unlikely with thousands of thumbnailed images.

## Comparison table

| Option | Free allowance | Sleep / cold start | EU region | Egress | Over the limit | Paid entry |
|---|---|---|---|---|---|---|
| **Render** web service | 750 instance-hours/month per workspace, 512 MB RAM, 0.1 CPU [1][2] | Spins down after 15 min idle; spin-up takes about 1 min [1] | Frankfurt [3] | Hobby plan includes 5 GB/month, then $0.15/GB [4] | Instance hours used up: free services suspended until next month. Bandwidth over the allowance with no payment method on file: free services suspended for the rest of the month [1] | Starter $7/mo, 512 MB, 0.5 CPU [2] |
| **Render** Postgres | 1 GB, 1 database per workspace, no backups [1] | — | Frankfurt [3] | as above | **Expires 30 days after creation**, deleted after a 14-day grace period [1] | (not checked) |
| **Railway** | Free plan: $1/month of credit, 0.5 GB RAM / 1 vCPU per service, no custom domains. Trial: $5 one-off for 30 days [5][6] | Not documented on the pricing pages [5][6] | Not stated on the pricing pages [5] | $0.05/GB [5] | When the credit balance hits zero, the subscription is cancelled and workloads are stopped [6] | Hobby $5/mo, includes $5 of usage; RAM ~$10/GB-mo, CPU ~$20/vCPU-mo [5] |
| **Fly.io** | **No free tier for new orgs**; $1 trial credit for 7 days. Bills under $5/month are waived for personal orgs [7] | Machines can be stopped; a stopped machine costs $0.15/GB-mo of rootfs [7] | Europe (rate group "North America and Europe") [7] | $0.02/GB in Europe [7] | Billed | shared-cpu-1x: 256 MB $2.19/mo, 512 MB $3.69/mo. Managed Postgres from $38/mo [7] |
| **Google Cloud Run** | Per month: 180,000 vCPU-s, 360,000 GiB-s, 2M requests (request-based billing), applied as a spending discount at Tier 1 prices [8][9] | Instances are started on demand (scale to zero) [8] | Warsaw `europe-central2` (Tier 2 pricing), Frankfurt, Belgium, etc. [8] | Only 1 GiB/month free, **North America only**, so EU egress is billed [8][9] | Billed; needs a billing account | Pay per use [8] |
| **Koyeb** | Free Postgres: 0.25 vCPU, 1 GB RAM, 1 GB storage, labelled "Free 5h" [10] | Scale-to-zero (no timings given) [10] | Postgres in Frankfurt [10] | (not checked) | (not checked) | Pro $29/mo [10] |
| **Hetzner CPX02** (VPS) | — | Always on | Helsinki, Falkenstein, Nuremberg [11][12] | 20 TB included in EU [12] | Monthly price cap: "bill will never exceed its monthly price cap" [12] | €5.49 (HEL1) / €6.49 (FSN1, NBG1) per month, excl. VAT; 1 vCPU, 1 GB, 20 GB [12] |
| **Neon** Postgres | 100 projects; 1 GB storage per project (20 GB total); 100 CU-hours per project per month; 5 GB egress per project [13] | Suspends after 5 min idle (cannot be turned off on Free); resumes in "a few hundred milliseconds" [13] | Frankfurt, London [14] | 5 GB/mo free [13] | CU-hours or egress exceeded: compute suspended until next period. Storage exceeded: writes blocked. **Nothing deleted** [13]. Free projects inactive for 90+ days may be deleted (from 2026-10-05) [14] | Launch: pay as you go, $0.106/CU-h, $0.35/GB-mo [13] |
| **Supabase** (DB + Storage) | 500 MB DB, 1 GB file storage, 5 GB egress (+5 GB cached), 50 MB max upload, 2 active projects, **no image transformations** [15] | **Paused after 1 week of inactivity** [15] | Frankfurt, Ireland, Paris, Stockholm (+ London, Zurich, which are outside the EU) [16] | 5 GB [15] | Grace period, then possible restrictions: projects paused, DB set to read-only, or HTTP 402 on API calls [17] | Pro $25/mo (8 GB DB, 100 GB storage, 250 GB egress) [15] |
| **Cloudflare R2** | 10 GB-month storage, 1M Class A ops, 10M Class B ops per month [18] | none | `eu` jurisdiction, or `weur`/`eeur` location hints [19] | **Free** [18] | Billed: $0.015/GB-mo, $4.50 per million Class A, $0.36 per million Class B [18] | Pay per use [18] |
| **Cloudflare Images** (transformations) | 5,000 unique transformations/month on Free; can transform images stored in R2 [20] | — | — | — | New transformations return error `9422`; cached ones keep being served; no charge [20] | $0.50 per 1,000 above 5,000 [20] |
| **Cloudflare Pages** | Static requests free and unlimited [21]; 500 builds/month, 20,000 files, 25 MiB per file, 100 projects [22] | none (static) | global edge | free | Static assets never invoke Functions, so no request limit applies [21] | — |
| **Netlify** | "300 credit limit"; bandwidth costs 20 credits per GB [23] | none (static) | — | via credits | Not stated on the pricing page [23] | — |

Not checked (out of the time budget): Vercel, Firebase Hosting, and Railway regions and sleep behaviour. None of these changes the recommendation.

## Notes per layer

### Backend (NestJS)
- **Render Free** is the only option here with a real always-free web service. It allows 750 hours per workspace per month, and spun-down services use no hours, so one service fits inside the allowance even if it ran 24/7 [1]. The 512 MB / 0.1 CPU spec [2] is enough for Nest with tens of users. Expect slow first requests after idle periods (about 1 min spin-up [1]).
- Render "may suspend a service that initiates unusually high outbound traffic" [1], which is one more reason to serve images from R2 and not stream them through Nest.
- **Cloud Run** has a generous compute free tier [9], but it requires a billing account, and its free egress covers North America only [8]. EU egress is billed from the first byte, so it costs very little but is not $0.
- **Fly.io** has no free tier for new orgs [7]. **Railway**'s $1/month credit [5] cannot keep a 0.5 GB service running all month (RAM alone is about $10/GB-month [5]).

### Frontend (Angular)
- Cloudflare Pages serves static assets free and without request limits [21]. Workers static assets work on the same terms: "Requests to static assets are free and unlimited" [24]. Serving the Angular build from Nest on Render would also work, but it would inherit the cold start and use up the 5 GB bandwidth allowance [4].

### Database (PostgreSQL)
- Neon Free is the best fit. It is in Frankfurt [14], wakes in a few hundred ms [13], and over-limit only suspends compute or blocks writes, with nothing deleted [13]. 1 GB is plenty for thousands of item rows. Keep at least occasional activity, because of the 90-day inactivity deletion policy for Free projects [14].
- Render free Postgres expires after 30 days [1], so it cannot be used. Supabase's 1-week inactivity pause [15] is a risk for a hobby app that may go unused for weeks.

### Object storage, CDN, image resizing
- R2 has free egress and 10 GB of free storage [18]. Create the bucket with the `eu` jurisdiction. The jurisdiction cannot be changed after creation, and EU buckets need the `https://<ACCOUNT_ID>.eu.r2.cloudflarestorage.com` S3 endpoint [19].
- **Resize on upload** in Nest: it is deterministic, costs nothing, and means only small thumbnails are served. On-the-fly resizing through Cloudflare Images is free up to 5,000 unique transformations/month. Past that, new variants fail with error `9422` on the Free plan [20]. That is fine for a few fixed sizes, but risky if many arbitrary sizes are requested.
- Supabase Storage on Free has no image transformations and only 1 GB [15].

## Sources (all checked 2026-11-18)

1. Render, Free instances: https://render.com/docs/free
2. Render, Pricing (compute table): https://render.com/pricing
3. Render, Regions: https://render.com/docs/regions
4. Render, Outbound bandwidth: https://render.com/docs/outbound-bandwidth
5. Railway, Pricing: https://railway.com/pricing
6. Railway, Plans: https://docs.railway.com/reference/pricing/plans
7. Fly.io, Pricing: https://docs.fly.io/about/pricing
8. Google Cloud Run, Pricing: https://cloud.google.com/run/pricing
9. Google Cloud, Free features: https://docs.cloud.google.com/free/docs/free-cloud-features
10. Koyeb, Pricing: https://koyeb.com/pricing
11. Hetzner, Cloud: https://www.hetzner.com/cloud
12. Hetzner, Regular Performance plans: https://www.hetzner.com/cloud/regular-performance
13. Neon, Pricing: https://neon.com/pricing
14. Neon, Regions: https://neon.com/docs/introduction/regions
15. Supabase, Pricing: https://supabase.com/pricing
16. Supabase, Regions: https://supabase.com/docs/guides/platform/regions
17. Supabase, Billing FAQ: https://supabase.com/docs/guides/platform/billing-faq
18. Cloudflare R2, Pricing: https://developers.cloudflare.com/r2/pricing/
19. Cloudflare R2, Data location: https://developers.cloudflare.com/r2/reference/data-location/
20. Cloudflare Images, Pricing: https://developers.cloudflare.com/images/pricing/
21. Cloudflare Pages Functions, Pricing: https://developers.cloudflare.com/pages/functions/pricing/
22. Cloudflare Pages, Limits: https://developers.cloudflare.com/pages/platform/limits/
23. Netlify, Pricing: https://www.netlify.com/pricing/
24. Cloudflare Workers static assets, Billing and limitations: https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/

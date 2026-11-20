# Shelvio MVP

Label: wayfinder:map

## Destination

A set of decisions complete enough to run `/to-spec` and `/to-tickets` and then implement the whole Shelvio MVP with nothing left to decide.

MVP: a responsive web app (Nx + Angular + NestJS + Postgres) with Google sign-in. Users keep **collections** of mixed **items** (books and vinyl records to start), organised with **shelves**, **tags** and **genres**, each marked as owned or wanted (the **wishlist**). Items can be added through external metadata APIs, a barcode scanner or by hand, and get covers, thumbnails and an optional user photo. Owners share collections by email invite, giving each person the **Contributor** or **Viewer** role. The UI is translatable, with Polish as the default.

## Notes

- Domain vocabulary lives in `GLOSSARY.md`; use its terms. Record hard-to-reverse decisions as ADRs in `docs/adr/`.
- **All documentation is written in English** (glossary, ADRs, tickets, research). Conversation with the user is in Polish.
- Tech stack is fixed: Nx monorepo, Angular frontend, NestJS backend, PostgreSQL.
- Scale: the user and their friends (tens of users, thousands of items). Prefer free or near-free tiers.
- After the MVP comes an **MCP server** that lets an LLM advise what to buy. The data model and backend API must be MCP-ready: rich, consistent data (genres from controlled lists, ratings, external IDs) and clean domain operations.
- No git repo yet: research findings go to `.scratch/shelvio-mvp/research/<name>.md` instead of a `research/<name>` branch.
- Resolving grilling tickets: call the Skill tool for `grilling` and `domain-modeling`.
- UI work: [`ui/README.md`](ui/README.md) indexes the UI brief (source of truth), theme and formatting decisions, design system and reference mockups.

## Decisions so far

<!-- one line per closed ticket: [title](issues/NN-slug.md): gist -->

- [Book metadata API](issues/01-book-metadata-api.md): Open Library primary (no key, cacheable), Google Books fallback (hotlink only, no storing covers); only ~30% of sampled Polish ISBNs found, so manual entry is a core flow.
- [Vinyl metadata API](issues/02-vinyl-metadata-api.md): Discogs primary (token required from 2026-12-01, 60 req/min, store release ID + master ID), MusicBrainz fallback; covers from Cover Art Archive, not Discogs.
- [Browser barcode scanning](issues/03-browser-barcode-scanning.md): `barcode-detector` package (ZXing WASM polyfill of the standard API), native where supported; EAN-13 978/979 = ISBN-13.
- [Hosting and file storage](issues/04-hosting-and-storage.md): Render (Nest, Frankfurt) + Cloudflare Pages (Angular) + Neon (Postgres, Frankfurt) + Cloudflare R2 (images, EU); $0/month, ~$7 for always-on API.
- [Technical foundations](issues/15-foundations.md): modular monolith, 5 modules as Nx `domain`+`feature` libs, domain operations shared by REST and future MCP with permissions checked inside (ADR-0001); Drizzle, Zod contracts, SignalStore + Angular Material, strict shell/feature/data-access/ui/util rules.
- [Item fields per item type](issues/05-item-fields-per-type.md): only type, title and ownership status (owned/wanted) required; global **Creators** linked by credits with roles; rating/consumed per item; price in minor units + currency; vinyl format structured, no condition or tracklist.
- [Translation approach](issues/14-i18n-approach.md): Transloco with per-feature lazy scopes and ICU plurals; Polish only, no language picker yet; backend returns error codes, genre names stored in the DB under English slugs.
- [Data model for item types](issues/07-item-type-data-model.md): `items` + one details table per type with typed columns (ADR-0002); enums as text + CHECK from shared Zod consts; typed external-ID columns; UUIDv7; soft delete for items and collections, no trash or purge yet (ADR-0003); contract nests per-type fields.
- [Authentication and sessions](issues/08-authentication.md): server-side Google OIDC code flow (`openid-client`) in Nest; opaque DB-backed sessions, 30-day sliding, `__Host-` cookie `SameSite=Lax` on a custom domain (`app.`/`api.`/`img.`), CORS + Origin check; user keyed by Google `sub`; invite-only (allowlist or invitation) checked at account creation.
- [Invitation flow](issues/09-invitation-flow.md): no emails, owner copies a message with a plain collection link; inviting gives access at once (Share, or Invitation converted on any sign-in with that email), no accept/decline; Invitations never expire, owner revokes or re-roles them; exact lowercased email match.
- [Permission matrix](issues/10-permission-matrix.md): contributors manage items, photos, shelves and tags; moving needs owner/contributor in both collections (shelf cleared, tags matched by name); viewers see all but **purchase details** (price, date, money totals); everyone sees the people list, only the owner sees Invitations and manages access/settings; no access → 404, weak role → 403.
- [Browse and search](issues/16-browse-and-search.md): one browse screen across all visible collections (collection is a filter, also the landing page), grid + list views, wishlist = wanted filter; diacritic-insensitive substring search (unaccent + trigram) over title, creators, publisher/label, IDs; OR-within/AND-across filters, Polish-collated sorting, price sort/filter only where purchase details are visible everywhere; no creator page; server-side, 50 per page, state in URL. Amended: the wishlist defaults to Owner/Contributor collections.
- [UI brief and theme](issues/20-ui-brief-and-theme.md): full UI brief with Stitch mockups in `ui/`; Angular Material M3 theme from seed colors with warm-charcoal dark mode and a Jasny/Ciemny/Systemowy switch; dates `dd.MM.yyyy`, `pl-PL` money, PLN only in the MVP UI; soft duplicate warning when adding.
- [Third-party data licensing and attribution](issues/19-third-party-data-licensing.md): lookups are one-time prefills the user owns, never refreshed (ADR-0004); copy only Discogs CC0 fields and Google facts, never source genres (suggestion input only); OL/CAA covers may be stored, Discogs/Google images picker-only; attribution in the picker, a "Źródła" line from external IDs, and a public "O aplikacji" page.
- [Genre lists and mapping](issues/06-genre-lists.md): one flat, fixed list per type (20 vinyl genres based on Discogs, 28 book genres modelled on Polish bookshops), none or several per item, no "Other"; source values mapped by an in-code table (exact names, keyword rules for free text) into confirmed "sugerowany" suggestions; list changed only by migrations, merged or retired, never deleted.
- [Item activity](issues/21-item-activity.md): nothing about who added/changed/deleted an item is shown in the MVP; `items` gains `updated_by_user_id`; no `*_by_user_id` fields in API responses; no history, feed or notifications.
- [Polish book coverage](issues/18-polish-book-coverage.md): Polish National Library (data.bn.org.pl, CC0, no key) first for 978-83 ISBNs, then e-ISBN (publisher ONIX, some covers), then Open Library (19/20 of a 2024 Polish sample vs 6/20 on OL alone); Google Books measured later with a key: 20/20 on the sample but thin Polish records (no publisher), user dropped it from the MVP (recorded in Add item flow); ADR-0004 and GLOSSARY since updated in Add-item flow.
- [Covers, photos and thumbnails](issues/11-covers-photos-thumbnails.md): public R2 bucket on `img.` behind Cloudflare CDN with random immutable keys (ADR-0005); covers copied once on save (e-ISBN/OL for books, CAA for vinyl); WebP `thumb` 480 + `large` 1200, no original kept; 10 MB JPEG/PNG/WebP, EXIF stripped; `images` table + daily 24 h sweep; MinIO for local dev.
- [Barcode scan prototype](issues/12-barcode-scan-prototype.md): book scanning on a phone is fast and reliable (native detector, 0.2–3.4 s, BN hit first) so it is a main path for books; unwrapped vinyl has no barcode, so vinyl is added mainly by search incl. catalogue number; show results before the slow cover lookup; iOS/WASM untested.
- [Add-item flow](issues/13-add-item-flow.md): Google Books dropped (ADR-0004 amended, BN + e-ISBN added); ISBN chain stops at first hit, title search BN + OL in parallel, vinyl via Discogs (barcode or `q`) with MusicBrainz fallback; scan picks the type from the code; failed sources skipped, separate "unavailable" state; duplicate notice by identifiers in Owner/Contributor collections; creators matched by external ID then normalised name; stay on the page after saving.
- [Lookup module and external API proxying](issues/22-lookup-module.md): two-step search (summary candidates + per-source status, then full candidate; cover URL resolved by backend, image hotlinked in picker); save sends edited fields + candidate ref (IDs and cover only); one adapter per source behind a seam, chains in an orchestrator; in-process per-source limiter, skip instead of queue, 12 s budget; 10-min shared in-memory cache; one User-Agent with `LOOKUP_CONTACT_EMAIL`; 30 searches/min per user; fixtures + fake sources for tests and e2e.
- [Sign-in for local development and e2e tests](issues/23-dev-and-e2e-sign-in.md): real Google in local dev, no bypass in the API; e2e (Daylo model) runs an isolated Postgres + MinIO per run and a fake OIDC provider, wired only by a separate e2e API entrypoint that refuses non-test environments; seeded owner/contributor/viewer/invited/outsider accounts sign in through the real browser flow; Chromium only.
- [Deployment pipeline and environments](issues/24-deployment-pipeline.md): GitHub Actions on the Daylo model (commitlint, Nx affected lint/test/build, affected e2e with 2 workers, no sharding yet), protected `main`; only local dev + ephemeral e2e environments; Drizzle migrations generated and committed, applied at API startup under an advisory lock, expand → contract, no down migrations; periodic jobs in-process, at most daily via a last-run row; `/health`, JSON logs; `.env` from `.env.example`, Zod-validated. Production deployment ruled out of the MVP.
- [Account lifecycle](issues/25-account-lifecycle.md): operator-only deletion via a CLI command calling Identity's `deleteAccount` (summary + confirmation); user row anonymised into a tombstone, sessions deleted; owned collections hard-deleted with everything in them (ADR-0003 amended); the user's Shares removed, their contributions to others' collections stay; re-sign-in is a fresh first sign-in through the gate.
- [Creator duplicates and corrections](issues/26-creator-duplicates.md): names NFC-normalised, inverted only for BN; matching by `name` and `sort_name`, name match refused on conflicting same-source IDs and fills missing IDs; operator-only CLI `creator:rename` / `creator:merge` (credits repointed, IDs combined, refused on conflicting IDs, search text refreshed), nothing in the UI; daily job deletes orphan creators older than 24 h.

## Not yet specified

<!-- empty: all remaining fog graduated into tickets -->

## Out of scope

- Item types beyond books and vinyl (CDs, etc.). The model must make adding them cheap, but they aren't built now.
- The MCP server itself (comes after the MVP).
- Native mobile apps.
- Import / export (CSV, Discogs collection, Goodreads).
- Transferring collection ownership.
- Offline mode.
- An item belonging to more than one collection.
- Trash view, restoring deleted items or collections, and purging soft-deleted rows (after the MVP; see [Data model for item types](issues/07-item-type-data-model.md)).
- Obtaining API credentials (Discogs token; Google Books is no longer used): an implementation setup step, done when implementation starts; no decision waits on it ([API credentials for metadata lookups](issues/17-api-credentials.md)).
- Item change history, a collection activity feed and notifications (ruled out by [Item activity](issues/21-item-activity.md); sorting by date added covers "what is new").
- Production deployment: custom domain and DNS, the deploy job and Render Blueprint, database backups and rollback, Render plan choice. The MVP is done when it runs locally with green CI; the code still targets the chosen hosting so deploying is configuration ([Deployment pipeline and environments](issues/24-deployment-pipeline.md)).
- Self-service account deletion in the UI; the MVP has only an operator command ([Account lifecycle](issues/25-account-lifecycle.md)).

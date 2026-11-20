# Vinyl metadata API: Discogs vs MusicBrainz + Cover Art Archive

Ticket: [02-vinyl-metadata-api](../issues/02-vinyl-metadata-api.md)
Sources checked: **2026-11-18**. Only official API docs, official terms pages and live API responses were used. The live calls were made on 2026-11-18 without credentials, from one IP, and are listed under "Live tests". Terms change often (Discogs changed its auth rules this month), so re-check the linked pages before building.

## Recommendation

**Use both sources, each for a different job.**

| Job | Source | Why |
|---|---|---|
| Identify the record (barcode, catalogue number, artist/title search) and import its metadata | **Discogs** (primary) | Covers vinyl at pressing level, and returns genres **and** styles, an LP/7"/180 g format breakdown, label + catno, and a vinyl-side tracklist (A1, B2…). In our tests it found every vinyl barcode MusicBrainz found, plus one MusicBrainz did not have (see "Live tests"). |
| Cover image that Shelvio **stores and resizes** | **Cover Art Archive** (looked up through the MusicBrainz barcode search), otherwise the **user's own photo** | Discogs lists release images as "Restricted Data" with a limited, non-commercial licence, and you may not store any Discogs content "longer than is necessary". Neither Discogs nor CAA grants an explicit licence to store resized copies, but CAA/MetaBrainz adds no API-terms restrictions of its own. |
| Fallback lookup when Discogs has no match | MusicBrainz | Needs no auth, and its core data is CC0. |

**External ID to store on a vinyl item:**
- `discogs_release_id` (integer, **release** = the specific pressing the user owns), as the main external ID.
- `discogs_master_id` (integer, nullable): used to group "same album, different pressings".
- Optional: `musicbrainz_release_id` (MBID, UUID), only when the cover came from CAA. It is needed to re-fetch the cover and give attribution.

Point the item at the **release**, not the master. A collector owns one physical pressing. Barcode and catalogue number identify a pressing, and the format details (2×LP, 180 g, reissue) exist only on the release. The master (Discogs) or release group (MusicBrainz) is the "album" concept and is useful only for grouping. Each Discogs release carries a `master_id` ([Discogs API: Release / Master](https://www.discogs.com/developers#page:database,header:database-master-release)).

**What later decisions depend on:**
1. **Discogs requires a token from 1 December 2026.** Unauthenticated calls will return `401` ([Discogs forum: API Update](https://www.discogs.com/forum/thread/1189875)). Shelvio needs a Discogs account with a **personal access token**, used server-side only (NestJS), and stored as a secret. OAuth is not needed because Shelvio does not act on behalf of Discogs users ([Discogs API: Authentication](https://www.discogs.com/developers#page:authentication)).
2. **Rate limits.** Discogs allows 60 req/min authenticated ([Discogs API: Rate Limiting](https://www.discogs.com/developers#page:home,header:home-rate-limiting)). MusicBrainz allows about 1 req/s per IP and returns 503 when exceeded ([MB Rate Limiting](https://musicbrainz.org/doc/MusicBrainz_API/Rate_Limiting)). CAA has no rate limit today ([CAA API](https://musicbrainz.org/doc/Cover_Art_Archive/API)). Both limits are far above what tens of users need, but calls must go through one server-side queue (throttle), not straight from the browser.
3. **Attribution is mandatory for Discogs.** Shelvio must show "Data provided by Discogs." next to Discogs data, with a followable link to the discogs.com page. It must also show a "not affiliated with Discogs" notice in its terms or docs ([Discogs API ToU](https://support.discogs.com/hc/en-us/articles/360009334593-API-Terms-of-Use)).
4. **Open legal point: the Discogs "6 hours" rule.** The ToU says content may not be displayed "if it is more than six (6) hours older" than Discogs, and may not be cached "longer than is necessary to provide a service to Your application's users" ([Discogs API ToU](https://support.discogs.com/hc/en-us/articles/360009334593-API-Terms-of-Use)). The same ToU puts titles, formats, tracklists, barcodes, identifiers and label names under CC0. Our proposed reading is that Shelvio copies only those CC0 fields into the user's item as a user-confirmed, user-editable snapshot, keeps no mirror of Discogs, and stores no Discogs images. Genres and styles are **not** on the ToU's CC0 list (see §4), so they are the grey area. Treat this reading as a product/legal decision to confirm, not as settled.
5. **Pricing.** Both sources are $0 at our scale. Discogs reserves "the right to charge for access ... in the future" ([Discogs API ToU](https://support.discogs.com/hc/en-us/articles/360009334593-API-Terms-of-Use)). MetaBrainz lists a $0 non-commercial tier, and paid tiers ($100+/mo) are for companies with revenue ([MetaBrainz account types](https://metabrainz.org/supporters/account-type)).

If the team weighs licence simplicity above coverage, the alternative is **MusicBrainz + CAA as the only source**. It needs no token, its core data is CC0 with no staleness rule, and images can be fetched freely. The cost is fewer pressings, no "styles", and genres that are often present only on the release group (see "Live tests").

## 1. Search by barcode and catalogue number; ambiguity

### Discogs
- `GET /database/search` has `barcode`, `catno`, `format`, `type` (release/master/artist/label), `artist`, `release_title`, `year`, `country` and other parameters ([Discogs API: Search](https://www.discogs.com/developers#page:database,header:database-search)).
- The docs say "Authentication (as any user) is required" for search ([Discogs API: Search](https://www.discogs.com/developers#page:database,header:database-search)). In practice, on 2026-11-18 search still answered without a token, at the 25/min unauthenticated rate and with empty `thumb`/`cover_image` fields. That stops on 1 Dec 2026 ([forum](https://www.discogs.com/forum/thread/1189875)).
- **Ambiguity is high**, because Discogs stores every pressing/repress as a separate release, and repressed records usually keep the same barcode. Live results:
  - Barcode `888837168618` (Daft Punk, *Random Access Memories* 2×LP) gave **11 results: 1 master and 10 vinyl releases** (2013 EU/US, 2017, 2021, 2022, 2023 represses), all with catno `88883716861` ([live call](https://api.discogs.com/database/search?barcode=888837168618)). Searching `catno=88883716861&format=Vinyl` gave 14 results ([live call](https://api.discogs.com/database/search?catno=88883716861&format=Vinyl)).
  - Barcode `886976805715` (Miles Davis, *Kind of Blue* LP) gave **11 vinyl releases**, all under master `5460` ([live call](https://api.discogs.com/database/search?barcode=886976805715&type=release&format=Vinyl)).
  - The `barcode` field in search results also contains matrix/runout and rights-society strings (e.g. "LC00162", "BIEM/GEMA"), because Discogs indexes all "barcodes and other identifiers" (same live call as above). Match results on exact digits on our side.
  - Without `format=Vinyl` the barcode search also returns CDs (barcode `8435395500316` matched a CD release, [live call](https://api.discogs.com/database/search?barcode=8435395500316&type=release)). Always add `type=release&format=Vinyl`.
- Implication for the UI: after a barcode scan, show a **pressing picker** (year, country, format text such as "180 g", label/catno, community "have" count for ordering). Pre-select the master's main release or the most-collected one, and keep "use album-level data" as an escape hatch.

### MusicBrainz
- Release search is Lucene-based and has `barcode`, `catno` ("insensitive to case, spaces, and separators"), `format`, `country`, `date`, `label`, `status` and `rgid` fields. Default limit is 25, max 100 ([MB API Search](https://musicbrainz.org/doc/MusicBrainz_API/Search)).
- Format is stored per medium (e.g. `12" Vinyl`), not per release ([MB Release](https://musicbrainz.org/doc/Release)).
- **Ambiguity is lower, mostly because coverage is thinner**:
  - Barcode `888837168618` gave **2 releases** (2013 and 2021) ([live call](https://musicbrainz.org/ws/2/release/?query=barcode:888837168618&fmt=json)). Discogs had 10.
  - Barcode `886976805715` gave **1 release** ([live call](https://musicbrainz.org/ws/2/release/?query=barcode:886976805715&fmt=json)). Discogs had 11.
  - Barcode `888751119215` gave 1 release on MB and 4 on Discogs (live calls, same pattern as above).
  - Barcode `8718469530748` (Bob Dylan 7" RSD reissue) gave **0 on MB** and **1 on Discogs** (live calls).
  - `catno:88883716861` gave the same 2 releases ([live call](https://musicbrainz.org/ws/2/release/?query=catno:88883716861&fmt=json)).

These are only a handful of barcodes, and some were chosen by first searching MusicBrainz, which biases the sample in MB's favour. Even so, Discogs was ahead every time.

## 2. Fields returned

| Field | Discogs `GET /releases/{id}` | MusicBrainz `GET /ws/2/release/{mbid}?inc=…` |
|---|---|---|
| Artist | `artists[]` | `artist-credit` (`inc=artist-credits`) |
| Title | `title` | `title` |
| Label + catalogue no. | `labels[].name`, `labels[].catno` | `label-info[].label.name`, `.catalog-number` (`inc=labels`) |
| Year / date | `year`, `released` | `date`, plus `first-release-date` on the release group |
| Format | `formats[]`: `name` "Vinyl", `qty` "2", `text` "180 Gram", `descriptions` ["LP","Album","Reissue"] | `media[].format` e.g. `12" Vinyl`; LP/EP/single only via release-group `primary-type` |
| Genres | `genres[]` (e.g. Electronic, Funk / Soul, Pop) | `genres[]` (`inc=genres`), often sparse on the release and richer on the release group |
| Styles | `styles[]` (e.g. Disco, Synth-pop, French House) | none (only free-form tags) |
| Tracklist | `tracklist[]` with vinyl positions (A1…D4) and durations | `media[].tracks[]` with `number` (A1…), `length` in ms (`inc=recordings`) |
| Barcode / identifiers | `identifiers[]` (Barcode, Matrix/Runout, …) | `barcode` |
| Master / group | `master_id`, `master_url` | `release-group.id` (`inc=release-groups`) |
| Cover images | `images[]` (`uri`, `uri150`, width, height). Auth needed (see §3) | Not in MB. Comes from Cover Art Archive by MBID (see below) |

Sources: Discogs field list from a live call to [`/releases/4570366`](https://api.discogs.com/releases/4570366) and the [Discogs API: Release](https://www.discogs.com/developers#page:database,header:database-release) docs. MusicBrainz fields from a live call to [`/ws/2/release/4867ceba-…?inc=recordings+labels+release-groups+genres+tags+artist-credits`](https://musicbrainz.org/ws/2/release/4867ceba-ffe7-40c0-a093-45be6c03c655?inc=recordings+labels+release-groups+genres+tags+artist-credits&fmt=json).

Concrete example (*Random Access Memories*): Discogs release 4570366 returned genres `Electronic, Funk / Soul, Pop` and styles `Disco, Funk, Synth-pop, Electro, French House`. The MB release returned only genre `electronic`, while its release group had 15 genres ("disco", "french house", "synth-pop", …) (same live calls).

**Cover Art Archive.** `GET https://coverartarchive.org/release/{mbid}` returns JSON with `images[]` (`types` such as Front/Back, `front`, `approved`, `thumbnails` 250/500/1200). `/release/{mbid}/front-250|500|1200` and `/release-group/{rgid}/front-…` redirect (307) to the image on archive.org ([CAA API](https://musicbrainz.org/doc/Cover_Art_Archive/API)). Live: the 2013 RAM release had 14 images, with front and back ([live call](https://coverartarchive.org/release/4867ceba-ffe7-40c0-a093-45be6c03c655)). The MB release JSON tells you whether art exists before you call CAA, via `cover-art-archive: {front: true, count: 14}` (same MB live call).

## 3. Authentication, rate limits, pricing

### Discogs
- **Auth options:** none, consumer key/secret, full OAuth 1.0a, or a personal access token. Per the docs table, the key/secret and token options get the "high tier" rate limit and **image URLs**, and unauthenticated requests do not ([Discogs API: Authentication](https://www.discogs.com/developers#page:authentication)). "If you do not plan on building an app which others can log into on their behalf, you should use [Discogs Auth]" ([same page](https://www.discogs.com/developers#page:authentication)). The token is sent as `Authorization: Discogs token=…`.
- **From 1 Dec 2026:** "Requests sent without credentials after December 1 will be rejected with a 401 Unauthorized error" ([forum thread](https://www.discogs.com/forum/thread/1189875); also on the [docs banner](https://www.discogs.com/developers)).
- **Rate limits:** "Authenticated requests are limited to 60 per minute, and unauthenticated requests are limited to 25 per minute", tracked as a moving 60-second window and reported in the `X-Discogs-Ratelimit`, `-Used` and `-Remaining` headers ([Discogs API: Rate Limiting](https://www.discogs.com/developers#page:home,header:home-rate-limiting)). The live responses carried `x-discogs-ratelimit: 25`. Creating extra keys to get around the limit is forbidden ([ToU](https://support.discogs.com/hc/en-us/articles/360009334593-API-Terms-of-Use)).
- **User-Agent:** must be a unique application identifier. Generic ones (curl, browser strings) may be blocked silently ([Discogs API: General Information](https://www.discogs.com/developers#page:home,header:home-general-information)).
- **Images** "require authentication and are subject to rate limiting". Image URLs are signed, so they cannot be built or modified by hand ([Discogs API: Images](https://www.discogs.com/developers#page:images), [FAQ](https://www.discogs.com/developers#page:home,header:home-faq)).
- **Pricing:** free today. Discogs "reserve[s] the right to charge for access ... in the future" ([ToU](https://support.discogs.com/hc/en-us/articles/360009334593-API-Terms-of-Use)).

### MusicBrainz / Cover Art Archive
- **Auth:** none needed for lookups and search (all MB live calls above were anonymous).
- **Rate limit:** "on average 1 request per second" per source IP, plus a global 300 req/s. Over-limit requests get **HTTP 503**. A meaningful User-Agent is required, e.g. `AppName/1.0 ( contact-url-or-email )`, and anonymous/library-default agents are throttled ([MB Rate Limiting](https://musicbrainz.org/doc/MusicBrainz_API/Rate_Limiting)). In our live calls we got 503 "The MusicBrainz web server is currently busy" twice at roughly 1 req/s. Implement retry with back-off. The responses also carried `X-RateLimit-Limit/Remaining/Reset` headers, which the docs do not mention.
- **CAA:** "There are currently no rate limiting rules in place" ([CAA API](https://musicbrainz.org/doc/Cover_Art_Archive/API)).
- **Pricing:** the non-commercial tier is "$0.00/month and up". Open-source developers and small non-profits are pointed to the $0 non-profit tier, and companies with revenue to paid tiers from $100/mo ([MetaBrainz account types](https://metabrainz.org/supporters/account-type)).

## 4. Terms of use: attribution, storing/resizing images, caching

### Discogs ([API Terms of Use, last updated 27 May 2025](https://support.discogs.com/hc/en-us/articles/360009334593-API-Terms-of-Use))
- **CC0 data:** "Release titles, notes, dates, format, track listings, barcodes and other identifiers, credits, versions, URL links"; artist names; label/manufacturer names. **Genres and styles are not listed explicitly.**
- **Restricted Data** includes **Images**: release, artist, label and user images. For Restricted Data you get a "limited, personal, non-sublicensable, non-transferable, non-exclusive, revocable license ... to create and run websites and applications", and you may not "Transfer Restricted Data to any third party" or "Use Restricted Data for any commercial purposes".
- **Caching/freshness:** "You may not display in any format or to any audience the Content if it is more than six (6) hours older than the information on Our online properties ... You may not cache or store the Content longer than is necessary to provide a service to Your application's users."
- **Storing or resizing images:** no clause grants it. Given the Restricted Data licence and the caching clause above, **storing resized Discogs images on our servers is not clearly permitted**. Shelvio should not do it. Showing a Discogs image live in the add-item picker (from an authenticated response) is in line with the terms.
- **Attribution:** show "This application uses Discogs' API but is not affiliated with, sponsored or endorsed by Discogs. 'Discogs' is a trademark of Zink Media, LLC." prominently (terms/docs are enough). Also show "Data provided by Discogs." next to the data, hyperlinked to the discogs.com page, without `nofollow`.
- **Commercial use** is "generally permitted". Charging for access to Discogs-derived features that Discogs offers for free needs written permission.

### MusicBrainz ([Data License](https://musicbrainz.org/doc/About/Data_License), [MusicBrainz Database](https://musicbrainz.org/doc/MusicBrainz_Database))
- **Core data is CC0:** artists, labels, mediums, recordings, release groups, releases, genres (the genre entities themselves), and more. It can be stored indefinitely, with no attribution or freshness rule.
- **Supplementary data is CC BY-NC-SA 3.0:** "tags (including genre associations) and ratings", annotations. So the genre **assignments** on a release are under NC licensing. That is fine for a non-commercial hobby app, but credit is needed.

### Cover Art Archive ([coverartarchive.org](https://coverartarchive.org/))
- "All images are copyrighted by their respective copyright owners." The CAA site and API docs state **no licence and no restriction** on downloading, storing or resizing. There is no API-terms layer like Discogs' Restricted Data. Storing a resized thumbnail of a cover for a personal-collection entry is the usual use, but its legal basis is the image owner's copyright, not a licence from CAA. Credit "Cover Art Archive" and keep the MBID so the source can be traced.

## 5. Master vs release

- **Discogs:** "The Release resource represents a particular physical or digital object released by one or more Artists." "The Master resource represents a set of similar Releases. Masters ... have a 'main release' which is often the chronologically earliest" ([Discogs API: Release, Master Release](https://www.discogs.com/developers#page:database,header:database-master-release)). `GET /masters/{id}/versions?format=Vinyl` lists the pressings. *Random Access Memories* has 19 vinyl versions ([live call](https://api.discogs.com/masters/556257/versions?format=Vinyl)). Masters have genres/styles but no barcode or label.
- **MusicBrainz:** "A MusicBrainz release represents the unique release (i.e. issuing) of a product" with date, country, label, barcode, packaging ([MB Release](https://musicbrainz.org/doc/Release)). "A release group ... is used to group releases into a single logical entity. Every release belongs to one, and only one, release group" ([MB Release Group](https://musicbrainz.org/doc/Release_Group)).
- **Which one the item references:** the **release**, because the user owns that physical pressing, and barcode/catno identify the release. Also store the master/release-group ID for grouping and for the "I don't know which pressing" fallback. If the user cannot choose a pressing, store `discogs_master_id` only, leave `discogs_release_id` null, and fill fields from the master's `main_release`.

## Live tests (2026-11-18, unauthenticated, User-Agent `ShelvioResearch/0.1`)

| Barcode | Record | Discogs vinyl releases | MusicBrainz releases |
|---|---|---|---|
| 888837168618 | Daft Punk – Random Access Memories (2×LP) | 10 (+1 master), all catno 88883716861 | 2 |
| 886976805715 | Miles Davis – Kind of Blue (LP, 2010 US) | 11, master 5460 | 1 |
| 888751119215 | Miles Davis – Kind of Blue (LP, 2015 EU) | 4, master 5460 | 1 |
| 8718469530748 | Bob Dylan – Can You Please Crawl Out Your Window? (7", RSD) | 1 | 0 |

Other observations:
- Discogs unauthenticated search returned `thumb: ""` and `cover_image: ""`. The unauthenticated `/releases/{id}` call still returned `images[]` URLs, which contradicts the docs table. Do not rely on that, since unauthenticated access ends on 1 Dec 2026.
- MusicBrainz returned 503 "currently busy" for 2 of about 10 calls spaced at about 1 s.
- MusicBrainz search results and the lookup disagreed on one release's country and date (search said `FR` / 2013-05-20, lookup said `DE` / 2013-05-17). This suggests a stale search index. Always re-fetch by ID before importing.

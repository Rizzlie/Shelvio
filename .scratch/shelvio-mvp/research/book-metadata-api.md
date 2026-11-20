# Book metadata API for Shelvio: Google Books vs Open Library

Ticket: [01-book-metadata-api](../issues/01-book-metadata-api.md)
Sources checked: **2026-11-18**, using official docs, terms of service and live API responses only. Live calls were made from one IP with a generic User-Agent and no personal data.

## Recommendation

| Role | Pick | Why |
|---|---|---|
| **Primary** | **Open Library** (`/isbn/{isbn}.json`, `/search.json`, Covers API) | No API key. Caching is explicitly encouraged. The Internet Archive "does not assert any new copyright" over the data, so we may store metadata in Postgres. ISBN-10 and ISBN-13 both work (tested). |
| **Fallback** | **Google Books API v1** (with an API key) for ISBNs that Open Library misses | Wider catalogue, `categories` field, cover links up to ~1280 px. But its terms forbid permanent copies and modification of returned content, and require "powered by Google" attribution, so treat it as a **form pre-fill only**. Never store or resize its covers. |
| **Last resort** | Manual entry plus a cover photo uploaded by the user | Open Library's Polish coverage is poor (see below), so manual entry is a core flow, not an edge case. |

Key facts later decisions depend on:
- **Polish coverage on Open Library is weak.** 6 of 20 real Polish ISBNs (30%) resolved. Well-known authors scored 5/11; a random sample of 2023 Polish books scored 1/9. Even resolved records often lack a cover (4/6 had none at edition level), authors (2/6) or subjects (3/6). Details are in [Live tests](#live-tests).
- **Google Books Polish coverage is unverified.** Keyless calls are refused with `429` and `quota_limit_value: "0"`, so a key is mandatory in practice, and I had none. **Before implementation, run the same 20-ISBN test with a key** (list below). If Google covers Polish books far better, it may become primary for *lookup*, but the storage constraints below still apply.
- **Covers.** Google: storing or resizing is **not allowed** (Google APIs ToS 5(e) bans "permanent copies" and "modify"). Hotlink only, as long as the cache header permits. Open Library: covers are meant to be shown via `src` URLs to `covers.openlibrary.org` on public pages, and bulk download through the API is not allowed. Storing one cover per book a user adds is not explicitly forbidden, but goes against that guidance. Cover art copyright stays with rights holders. The hosting plan stores and resizes covers in R2 ([hosting-and-storage.md](hosting-and-storage.md)), which fits **user-uploaded** covers and arguably Open Library covers, but **not** Google covers.
- **Quotas.** Open Library allows 1 req/s anonymous and **3 req/s when identified** with a User-Agent that includes a contact email. Cover lookups by ISBN are capped at 100 per IP per 5 minutes (by cover ID there is no such cap). Google publishes no default daily quota in its Books docs; it is per project and visible in the Cloud Console. Neither service lists any price. Google's Books terms forbid **charging users** for the app without Google's permission.
- **ISBNs in the ticket are invalid.** `9788308062246` and `9788324631766` fail the ISBN-13 checksum (the correct check digits would be 5 and 9). Open Library returns 404 for both and the Polish National Library catalogue has no record of either. **Validate the checksum client-side** before calling any API.

Optional follow-up: the Polish National Library's open API (`data.bn.org.pl`) returned full records (title, author, publisher, year, subject, genre, language) for every Polish ISBN I used. That is selection bias, because the sample came from it. It has no covers, and I did not find a stated licence or rate limit on its home page ([data.bn.org.pl](https://data.bn.org.pl/)). It is worth a short separate check as a Polish-specific fallback ahead of Google.

## Comparison

| | Open Library | Google Books API v1 |
|---|---|---|
| Auth | None; identify with `User-Agent: AppName (contact email)` [OL-API] | API key or OAuth token required: "A request that does not provide an OAuth 2.0 token must send an API key" [GB-USING]. Keyless returns 429 with limit 0 (live test) |
| Rate limits / quota | 1 req/s anonymous, 3 req/s identified [OL-API]; covers by ISBN/OCLC/LCCN: 100 req per IP per 5 min, then 403 [OL-COVERS] | Per-project quota set by Google [GAPI-TOS §2(d)]; the default figure is not published in the Books docs [GB-USING][GB-START]. Check Cloud Console → Books API → Quotas |
| Price | No pricing on the API page [OL-API] | No pricing in Books docs [GB-START]; you may not charge users for the app without Google's permission [GB-TOS "Fees"] |
| ISBN-10 / 13 | Both: "followed by a valid ISBN 10 or 13" [OL-BOOKS]; verified live for `0140328726`/`9780140328721` and Polish `8308039448`/`9788308039441` | `q=isbn:<isbn>` [GB-USING]; returns `industryIdentifiers` of type `ISBN_10`/`ISBN_13` [GB-VOL] (not verified live, no key) |
| Title/author search | `search.json` (batch-friendly; recommended over many single requests) [OL-API] | `intitle:`, `inauthor:`, `inpublisher:`, `subject:` keywords, up to 40 results per page, `langRestrict` (ISO-639-1) [GB-USING] |
| Fields | Edition: `title`, `authors` (keys), `publishers`, `publish_date` (free text), `languages`, `number_of_pages`, `subjects`, `covers`, `isbn_10/13`, `works` (live). Work: `subjects`, `covers` (live). Books API `jscmd=data` adds `subjects`, `subject_places/people/times`, `cover`, `number_of_pages` [OL-BOOKS] | `title`, `authors`, `publisher`, `publishedDate`, `industryIdentifiers`, `pageCount`, `categories`, `mainCategory`, `language` (ISO 639-1), `imageLinks`, `dimensions` [GB-VOL] |
| Subjects for genre mapping | Free-text, mixed LCSH-style and Polish terms, e.g. `"Fiction, historical, general"`, `"Powieść fantastyczna polska"` (live). Often missing on editions; the work level is richer | `categories` such as "Fiction", "Suspense" [GB-VOL] |
| Covers | `covers.openlibrary.org/b/{id|isbn|olid|...}/{value}-{S|M|L}.jpg`; `?default=false` returns 404 instead of a blank image [OL-COVERS]. No pixel sizes documented; a sampled `-L` was 320×500 (live) | `smallThumbnail` ~80 px, `thumbnail` ~128, `small` ~300, `medium` ~575, `large` ~800, `extraLarge` ~1280 px wide, "for all the sizes that are available" [GB-VOL] |
| Caching / storing | "Cache responses whenever possible" [OL-API]; no new copyright asserted over the database [OL-LIC]; no bulk harvesting via API, use the monthly dumps [OL-API] | No "permanent copies", no "build databases", cached copies only as long as the cache header permits [GAPI-TOS §5(e)] |
| Modify / resize covers | Display via `src` to covers.openlibrary.org on public pages; do not crawl; bulk via archive.org [OL-COVERS] | Must not "modify, create a derivative work of" content [GAPI-TOS §5(e)]; "You must not alter results or content" [GB-BRAND] |
| Attribution | Courtesy link back is "appreciated" [OL-COVERS] | "powered by Google" logo adjacent to results, plus a prominent link per book to its Google Books page [GB-BRAND]; display required attributions [GAPI-TOS §6(b)] |
| Other obligations | Not for "high-traffic commercial infrastructure" [OL-API] | Remove allegedly infringing content on request and publish a contact for rights holders [GB-TOS] |

## Live tests

Sample: 20 real Polish ISBNs taken from the Polish National Library API (`https://data.bn.org.pl/api/institutions/bibs.json?author=...` and `?publicationYear=2023&kind=książka`). Each was checked with `GET https://openlibrary.org/isbn/{isbn}.json`.

| ISBN | Book (per BN) | Open Library |
|---|---|---|
| 9788308039441 | Tokarczuk, *Prawiek i inne czasy* (WL) | 200. Edition has no cover and no page count; work has 12 covers and 9 subjects |
| 8308039448 | same, ISBN-10 | 200 (same edition) |
| 9788308046548 | Tokarczuk, *Prawiek…* (other binding) | 404 |
| 8308037119 | Tokarczuk (older ISBN-10) | 404 |
| 9788308040317 | Tokarczuk, *Gra na wielu bębenkach* | 404 |
| 9788373846920 | Twardoch, *Epifania wikarego Trzaski* | 200. Pages, Polish subjects; no cover |
| 9788370541965 | Twardoch, *Sternberg* | 200. No subjects, no cover |
| 9788375780123 | *Prawem wilka* (SuperNowa) | 404 |
| 9788324585120 | *Zimne wybrzeża* (Publicat) | 404 |
| 9788362329939 | Mróz, *Prędkość ucieczki* | 200. Cover, but **no authors** |
| 9788311133327 | Mróz, *Turkusowe szale* | 200. Pages, subjects, ISBN-10; no cover |
| 9788379950164 | Mróz, *Chór zapomnianych głosów* | 404 |
| 9788378865759 | Heller, *Bóg i geometria* (2023) | 404 |
| 9788395500879 | *Stacja Radegast* (2023) | 404 |
| 9788382251586 | Taylor, *Jak człowiek staje się mordercą* (2023) | 404 |
| 9788378865162 | Sumpter, *Piłkomatyka* (2023) | 404 |
| 9788382220247 | *Ćwiczenia logopedyczne…* (2023) | 404 |
| 9788365520777 | Urasawa, *Monster t. 4* (2023) | 404 |
| 9788379125036 | *Warmińsko-mazurskie: przewodnik* (2023) | 404 |
| 9788382523898 | Osho, *Dojrzałość* (2023) | 404 |
| 9788367032148 | Bellingham, *Ogród Bellingham* (2023) | 200. Cover, but no authors and no language |

Edition hits: **6/20** for the 20 sampled ISBNs. `8308039448` was an extra test of ISBN-10 lookup on a known hit and is not counted. Open Library's search index contains about 239k works tagged `language:pol` (`search.json?q=language:pol`, live), mostly older or translated titles judging by the sample above.

Control: `9780140328721` and `0140328726` (*Fantastic Mr. Fox*, Puffin) both resolved to the same edition, with covers and page count.

Google Books: every call (`https://www.googleapis.com/books/v1/volumes?q=isbn:...`, also on `books.googleapis.com`) returned `429 RESOURCE_EXHAUSTED`, `quota_limit: defaultPerDayPerProject`, `quota_limit_value: "0"`. So coverage could not be measured. To repeat the test, add `&key=<API key>` and loop over the 20 ISBNs above.

Implementation notes that follow from the tests:
- When an edition lacks a cover or subjects, fall back to its `works[0]` record (live: *Prawiek* edition had neither; its work had both).
- Edition `authors` is a list of keys (`/authors/OL…A`), so a second request is needed for the name. Alternatively, use `search.json?isbn=…&fields=author_name,…`, which returns names in one call (live).
- Fetch covers by **cover ID** (`/b/id/{cover_i}-M.jpg`), not by ISBN, to avoid the 100-per-5-minutes limit [OL-COVERS].

## Sources

- [OL-API] Open Library, Developers / API: https://openlibrary.org/developers/api
- [OL-BOOKS] Open Library Books API: https://openlibrary.org/dev/docs/api/books
- [OL-COVERS] Open Library Covers API: https://openlibrary.org/dev/docs/api/covers
- [OL-LIC] Open Library licensing: https://openlibrary.org/developers/licensing
- [GB-TOS] Google Books APIs Terms of Service (last modified 2012-04-25): https://developers.google.com/books/terms
- [GAPI-TOS] Google APIs Terms of Service (last modified 2021-11-09): https://developers.google.com/terms
- [GB-USING] Google Books API, Using the API: https://developers.google.com/books/docs/v1/using
- [GB-START] Google Books API, Getting started: https://developers.google.com/books/docs/v1/getting_started
- [GB-VOL] Google Books API, Volumes reference: https://developers.google.com/books/docs/v1/reference/volumes
- [GB-BRAND] Google Books branding guidelines: https://developers.google.com/books/branding
- Polish National Library open data (source of the test ISBNs): https://data.bn.org.pl/
- Live responses: `https://openlibrary.org/isbn/{isbn}.json`, `https://openlibrary.org/search.json`, `https://covers.openlibrary.org/b/id/9258700-L.jpg`, `https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}`, all called on 2026-11-18.

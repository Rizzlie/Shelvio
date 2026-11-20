# Polish book coverage: Google Books, Polish National Library, e-ISBN

Ticket: [18-polish-book-coverage](../issues/18-polish-book-coverage.md)
Builds on: [book-metadata-api.md](book-metadata-api.md) (Open Library 6/20 on the same sample), [ADR-0004](../../../docs/adr/0004-lookups-are-one-time-prefills.md)
Sources checked: **2026-11-20**, using official docs, terms and live API responses only. Live calls were made from one IP with a generic User-Agent (`ShelvioResearch/0.1`), no API key and no personal data.

## Recommendation

| Order | Metadata source | When | Why |
|---|---|---|---|
| 1 | **Polish National Library (BN), `data.bn.org.pl`** | ISBNs in the Polish groups (`978-83…`, `83…` ISBN-10) | **CC0 1.0** [BN-DOCS]. 20/20 on the ticket sample and **17/20 on an independent 2024 sample** (below). Clean MARC with creator roles, publisher, year, pages, series and DBN genre/form terms. No key, no published rate limit. No covers. |
| 2 | **e-ISBN** (`e-isbn.pl/IsbnWeb/api.xml`, run by BN's ISBN agency) | BN miss, or to get a cover for a Polish ISBN | Publisher-supplied ONIX 3.0, no auth [EISBN-API]. Found 2 of the 3 BN misses (new small-press titles). Sometimes has a cover that publishers have agreed may be reused "for informational purposes" [EISBN-REG]. Hit rate alone is low (8/19 on the ticket sample). |
| 3 | **Open Library** | Non-Polish ISBNs first; Polish ISBNs after BN/e-ISBN; cover lookup for any ISBN | Unchanged from [book-metadata-api.md](book-metadata-api.md). Weak on Polish books (6/20), but the only permitted cover source besides user photos and e-ISBN. |
| — | **Google Books** | **Drop from the MVP** | Keyless access is still impossible (`429`, daily quota `0`, confirmed again today from two networks), so Polish coverage stays **unmeasured**. With BN + e-ISBN covering 19/20 of an unbiased Polish sample, Google's costs (API key in [17-api-credentials](../issues/17-api-credentials.md), "powered by Google" in the picker, no stored covers or descriptions, takedown contact, ban on charging users) buy little. Revisit only if real users hit many manual entries for foreign books. |
| last | Manual entry with the scanned ISBN kept | Nothing found | Expected for e-books/audiobooks from platforms (e.g. Empik Go) and some self-published titles. |

Routing rule: normalise the input (strip hyphens/spaces; BN and e-ISBN return **nothing** for hyphenated ISBNs, live), validate the checksum, convert ISBN-10 to ISBN-13 for e-ISBN (it accepts 13 digits only [EISBN-API]), then route by registration group: `978-83` / `83` → BN, e-ISBN, Open Library; everything else → Open Library, then BN (BN also catalogues foreign-language books held in Polish libraries, e.g. the title search below found Czech, Swedish and Serbian Tokarczuk translations). Query the **cover** in parallel: e-ISBN cover if present, else Open Library cover by cover ID.

Both BN and e-ISBN send **no CORS headers** (live), so lookups must go through Shelvio's backend, which is consistent with ADR-0004's short-lived backend cache.

## Live tests

### Ticket sample (20 ISBNs from book-metadata-api.md)

Google Books: every request to `https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}` (also `books.googleapis.com`, a `/volumes/{id}` call, and the English control ISBN `9780140328721`) returned `429 RESOURCE_EXHAUSTED`, `quota_limit: defaultPerDayPerProject`, `quota_limit_value: "0"`, consumer `projects/624717413613` (Google's shared project for keyless calls). The same request through a separate fetch service on another network also returned 429. So the ticket comment's assumption that the anonymous quota is "plenty" does not hold: **the anonymous quota is zero**, and no hit/miss data could be collected. A key from ticket 17 is required to measure Google at all.

BN: `GET https://data.bn.org.pl/api/institutions/bibs.json?isbnIssn={isbn}`. e-ISBN: `GET https://e-isbn.pl/IsbnWeb/api.xml?isbn={isbn}` (an empty response is an ONIX header with no `<Product>`, 808 bytes).

| ISBN | Book | Google | BN | BN field notes | e-ISBN | Open Library (2026-11-18) |
|---|---|---|---|---|---|---|
| 9788308039441 | Tokarczuk, *Prawiek i inne czasy* | 429 | hit | One record lists 6 ISBNs (bindings, ISBN-10s). Publisher abbreviated "Wydaw. Literackie"; no `$e` role | miss | hit |
| 9788308046548 | same, hardcover | 429 | hit | same record | miss | miss |
| 8308037119 | same, older ISBN-10 | 429 | hit | same record | n/a (13-digit only) | miss |
| 9788308040317 | Tokarczuk, *Gra na wielu bębenkach* | 429 | hit | Flat `title` concatenates all 16 story titles; use MARC 245 | miss | miss |
| 9788373846920 | Twardoch, *Epifania wikarego Trzaski* | 429 | hit | Series "Behemot" (490) | miss | hit |
| 9788370541965 | Twardoch, *Sternberg* | 429 | hit | Genres "Political fiction", "Powieść" | miss | hit |
| 9788375780123 | Twardoch, *Prawem wilka* | 429 | hit | No subject terms; genre present | miss | miss |
| 9788324585120 | Twardoch, *Zimne wybrzeża* | 429 | hit | complete | miss | miss |
| 9788362329939 | Mróz, *Prędkość ucieczki* | 429 | hit | Series "Parabellum", vol. "t. 1" | miss | hit (no authors) |
| 9788311133327 | Mróz, *Turkusowe szale* | 429 | hit | Year "copyright 2014." needs parsing | hit, cover | hit |
| 9788379950164 | Mróz, *Chór zapomnianych głosów* | 429 | hit | Genres Horror, Powieść, Science fiction | hit | miss |
| 9788378865759 | Heller, *Bóg i geometria* | 429 | hit | Subtitle in 245 `$b` | miss | miss |
| 9788395500879 | *Stacja Radegast* | 429 | hit | MARC 260 `$c` says 2020, flat `publicationYear` 2023 | hit | miss |
| 9788382251586 | Taylor, *Jak człowiek staje się mordercą* | 429 | hit | Translator with role "Tłumaczenie"; original title in 246 | hit | miss |
| 9788378865162 | Sumpter, *Piłkomatyka* | 429 | hit | 2 translators with roles; edition "Wydanie II, dodruk" | miss | miss |
| 9788382220247 | *Ćwiczenia logopedyczne…* | 429 | hit | Authors + illustrator with roles | hit | miss |
| 9788365520777 | Urasawa, *Monster t. 4* | 429 | hit | Volume in 245 `$n`; genre "Manga" | miss | miss |
| 9788379125036 | *Warmińsko-mazurskie: przewodnik* | 429 | **2 records** | 2022 and 2023 printings share one ISBN; the picker must offer both | hit | miss |
| 9788382523898 | Osho, *Dojrzałość* | 429 | hit | Series "Nowa jakość życia" | hit, cover | miss |
| 9788367032148 | Bellingham, *Ogród Bellingham* | 429 | hit | Roles "Tekst", "Fotografie" | hit, cover | hit (no authors) |
| **Total** | | **0/20 measurable** | **20/20** | | **8/19** (+1 n/a) | **6/20** |

BN's 20/20 is **selection bias**: the sample was drawn from BN. Hence the second test.

### Independent sample (20 Polish ISBNs from Open Library, 2024)

Taken from `https://openlibrary.org/search.json?q=language:pol&first_publish_year=2024&fields=isbn,title` (first 20 docs with a `97883…` ISBN-13), so they are Open Library hits by construction and independent of BN.

| Result | Count | ISBNs |
|---|---|---|
| BN hit (`institutions`) | **17/20** | incl. translated children's books, manga (*Spy x family 13*), non-fiction (*Autocracy, Inc.*) |
| BN miss, e-ISBN hit | 2 | `9788397275140`, `9788397275157` (small press, 2024) |
| Miss in BN (`institutions` and `networks`) and e-ISBN | 1 | `9788327283887` *Coś fantastycznego* (publisher "Empik Go", an audiobook/e-book platform) |

So **BN + e-ISBN = 19/20** on an unbiased recent sample, versus 6/20 for Open Library on the ticket sample. The BN union catalogue endpoint (`/api/networks/bibs.json`, "połączone katalogi") found none of the 3 BN misses, so it adds nothing for lookups.

## Polish National Library API (data.bn.org.pl)

| | Finding |
|---|---|
| Licence | "Warunki wykorzystywania danych (licencja): CC0 1.0" on both the API docs and the dump page [BN-DOCS][BN-DB]. Fields may be copied and stored with no attribution obligation. |
| Auth | None. |
| Rate limits | None documented [BN-DOCS]; no rate-limit headers; 15 back-to-back requests all returned 200 in ~0.12 s each (live). Be polite anyway: one request per lookup, User-Agent with contact. |
| Endpoints | `/api/institutions/bibs.{json,xml,marcxml,marc}` (BN's own records) and `/api/networks/bibs.*` (union catalogue) [BN-DOCS]. Also authority records, MeSH-Pol, OAI-PMH, and daily full dumps (`bibs-ksiazka.marc` 3.56 GB) [BN-DB]. |
| ISBN search | `isbnIssn=` matches MARC 020 `$a$z`, 022, 024, 028, 490 `$x`, 773 `$x` [BN-DOCS], so one record is found by any of its ISBNs, including ISBN-10 and invalid/cancelled ones (`$z`). Digits only; hyphenated input returns 0 (live). |
| Title/author search | `title=`, `author=`, `publisher=`, `publicationYear=`, `kind=książka`, `language=`, optional `boolean=true` with `|`, `-`, `()` operators; `limit` up to 100 [BN-DOCS]. Title search returns translations too, so add `language=polski` or rank Polish first. |
| Fields (flat JSON) | `title`, `author`, `publisher`, `publicationYear`, `language`, `genre`, `formOfWork`, `subject`, `isbnIssn`, `placeOfPublication`, `udc`, `languageOfOriginal` and full `marc`. The flat fields are **concatenations** (e.g. `author` mixes people and the publisher; `title` appends series and original title), so parse MARC instead. |
| Fields (MARC) | 245 `$a$b$n` title/subtitle/volume; 100/700 `$a` name, `$d` dates, `$e` role in Polish (Autor, Tłumaczenie, Ilustracje, Redakcja…; missing on older records, where 100 means author); 260/264 `$b` publisher, `$c` year (may read "copyright 2014."); 300 `$a` pages ("301, [3] s.", take the first number); 041 `$a` language (missing on 9/20; fall back to 008 positions 35–37); 250 edition; 490 `$a$v` series and volume; 655 DBN genre/form terms; 380 form of work; 246 original title. |
| Genres | 655 gave usable terms on 20/20 (Powieść, Sensacja, Horror, Science fiction, Manga, Poradnik, Przewodnik turystyczny…). These are Polish controlled terms, which suits the keyword mapping of [06-genre-lists](../issues/06-genre-lists.md). As CC0 data they could even be stored, but ADR-0004/06 store Shelvio genre IDs only, which still works. |
| Covers | None. |
| CORS | No `Access-Control-Allow-Origin` (live). Backend only. |
| Human link | Field 009 holds the Alma ID; `https://katalogi.bn.org.pl/discovery/fulldisplay?docid=alma{009}&vid=48OMNIS_NLOP:NLOP` answers 200 (a JS app; record rendering not verified). Usable for the item page "Źródła" link. |

No newer BN lookup API was found: the catalogue front end (`katalogi.bn.org.pl`, Ex Libris Alma/Primo) has no documented public API, and data.bn.org.pl is BN's documented open-data channel.

## e-ISBN API

| | Finding |
|---|---|
| What | BN's ISBN agency service, where Polish publishers register ISBNs and describe their books [EISBN-REG]. |
| Endpoint | `https://e-isbn.pl/IsbnWeb/api.xml?isbn={13 digits}`; also `prefix`, `dateFrom/dateTo`, `max` ≤ 100, `idFrom` paging. GET or POST, **no authorisation** [EISBN-API]. |
| Format | ONIX 3.0 XML [EISBN-API]: `TitleText`/`Subtitle`, `Contributor` with ONIX role codes (A01 author, B06 translator…) and sequence, `PublisherName`/`ImprintName`, `PublishingDate`, `Extent` (pages), `Language`, `ProductForm` (BB/BC hardback/paperback, ED/EB digital…), `Measure` (dimensions), Thema subject codes (scheme 93), `TextContent` (blurb, author bio, table of contents), `SupportingResource` cover link (live). |
| Coverage | Only what publishers registered and published ("upublicznione") [EISBN-REG]; 8/19 on the ticket sample, strongest on recent small presses. Publisher names are legal names ("DEMART SPÓŁKA AKCYJNA"), so prefer `ImprintName` or the BN form. |
| Covers | 3 of 10 hits had a cover link (`/IsbnWeb/record/show_cover.jpg?picture_id=…`, a sampled one was a 4.3 MB JPEG). Terms: uploading a cover "is equivalent to consenting to the use of this scan in the e-ISBN service and to making it available to interested parties for further use for informational purposes" [EISBN-REG]. |
| Licence for metadata | **None stated.** The terms say the ISBN database is "available free of charge to the public" [EISBN-REG]. Treat like Google: copy factual fields only. |
| Rate limits | None documented [EISBN-API]. Responses took ~0.8 s, one 6.4 s (live). |
| CORS | None (live). Backend only. |

## Licensing implications (ADR-0004)

- **BN** is CC0 [BN-DOCS], so it is the cleanest source Shelvio has: every field may be copied once at the user's confirmation, and no attribution is required. A "Biblioteka Narodowa" link in the "Źródła" line is a courtesy, built from the stored BN record ID like the other sources.
- **e-ISBN** states no data licence. Under ADR-0004 copy factual fields only (title, subtitle, creators, publisher, year, pages, ISBN, language). **Never copy `TextContent`** (blurb, bio, table of contents): it is publisher prose, protected like Google's descriptions. Covers carry the publisher's consent for informational reuse [EISBN-REG]; storing and resizing one cover per user-added item, never in bulk, fits that wording for a non-commercial catalogue, in the same way ADR-0004 already allows Open Library covers. This is an interpretation, not an explicit licence.
- **Google Books**: dropping it removes the only source that needs an API key, the "powered by Google" logo, and the Google credit and takedown wording from the "O aplikacji" page. If it stays, ADR-0004's Google rules stand unchanged.
- **Follow-ups for the owner of ADR-0004 / GLOSSARY.md** (not edited here): ADR-0004's "What may be copied" list and the **Metadata source** examples in `GLOSSARY.md` name only Open Library, Google Books, Discogs and MusicBrainz. Adding BN and e-ISBN (and removing Google, if agreed) needs an ADR update, plus a matching change to the "O aplikacji" credits and the "Źródła" line in `ui/ui-brief.md`.


## Addendum 2026-11-20: Google Books with an API key

Re-run with a key (restricted to Books API), `GET https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}&country=PL`, first result.

| Sample | Google hits | Notes |
|---|---|---|
| Ticket sample (20, incl. ISBN-10 `8308037119`) | **20/20** | Authors 19/20 (*Stacja Radegast* none). **Publisher 0/20.** Page count 16/20, categories 7/20, covers (`imageLinks`) 3/20. Some titles lose diacritics or carry the series ("Parabellum 1 Predkosc ucieczki", "Chor zapomnianych glosow"). |
| Independent sample, the 3 BN misses | **1/3** | Found `9788327283887` (Empik Go, the one BN + e-ISBN missed), with publisher and cover. Missed both small-press 2024 ISBNs that e-ISBN has. |
| Foreign controls (6: EN, FR, DE) | 6/6 | Open Library also 6/6, with publishers. |

Reading: Google's Polish **coverage** is as good as BN's and covers the one gap BN + e-ISBN left (so BN + e-ISBN + Google = 20/20 on the independent sample), but its Polish **records are thinner** (no publisher, sometimes stripped diacritics) and its covers may not be stored anyway (ADR-0004). It is a useful last-resort fallback, not a primary source. Whether it stays in the MVP is now a cost/benefit call for the Add item flow ticket, no longer "unmeasured".

## Sources

- [BN-DOCS] BN Data, API documentation (licence CC0 1.0, endpoints, parameters, MARC field mapping): https://data.bn.org.pl/docs
- [BN-DB] BN Data, downloadable databases (CC0 1.0, dump sizes): https://data.bn.org.pl/databases
- [BN-HOME] BN Data home: https://data.bn.org.pl/
- [EISBN-API] e-ISBN API documentation (PDF): https://e-isbn.pl/IsbnWeb/start/Dokumentacja_API.pdf
- [EISBN-REG] e-ISBN terms, "Regulamin przydzielania numerów ISBN" (publisher data, cover consent, public ISBN database): https://e-isbn.pl/IsbnWeb/start/regulamin.html
- [GB-USING] Google Books API, Using the API (key or OAuth required): https://developers.google.com/books/docs/v1/using
- Prior findings on Open Library and Google Books terms: [book-metadata-api.md](book-metadata-api.md)
- Live responses, all on 2026-11-20: `https://data.bn.org.pl/api/institutions/bibs.json?isbnIssn={isbn}`, `https://data.bn.org.pl/api/networks/bibs.json?isbnIssn={isbn}`, `https://data.bn.org.pl/api/institutions/bibs.json?title=Bieguni&author=Tokarczuk`, `https://e-isbn.pl/IsbnWeb/api.xml?isbn={isbn}`, `https://e-isbn.pl/IsbnWeb/record/show_cover.jpg?picture_id=151416`, `https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}`, `https://openlibrary.org/search.json?q=language:pol&first_publish_year=2024`.

# Item fields per item type

Type: grilling
Status: resolved
Blocked by: 01, 02
Map: [Shelvio MVP](../map.md)

## Question

What exact fields does an item have: which are common to all item types and which belong to book or vinyl record, and which are required?

Starting point agreed during charting:
- **Common:** title, genres (several, from a controlled list), ownership status (owned/wanted), rating (1–5), consumed status (read/listened or not), purchase date, purchase price, notes, shelf (at most one), tags (many), cover, user photo, external IDs.
- **Book:** authors, ISBN, publisher, year, language, page count.
- **Vinyl record:** artist(s), label, year, catalogue number, format (LP/EP/7"…), media and sleeve condition (Goldmine scale), tracklist.

Settle naming, types, required vs optional, multi-value fields (several authors or artists?), currency for the price, and what the research says the APIs can actually fill in.

## Answer

All fields are optional unless marked **required**. Field names below are the canonical English names.

**Common to every item**
- `itemType` (book | vinyl), **required**.
- `title`, **required**.
- `ownershipStatus` (owned | wanted), **required**, defaults to owned. No other values (no ordered, no sold).
- `priority` (low | medium | high): wanted items only.
- `rating`: integer 1–5, no halves. One value per item, not per person; allowed on wanted items too.
- `consumed`: boolean, no date. Shown as "read" or "listened" by item type. One value per item; allowed on wanted items.
- `purchaseDate` (date) and `purchasePrice` (integer minor units + ISO 4217 currency, default PLN): owned items only. Switching owned → wanted keeps the values but hides them. No currency conversion; totals are per currency. No "where bought" field.
- `notes`: plain text, about 5000 chars max. Who sees them is for **Permission matrix**.
- Genres, shelf, tags, cover and user photo are settled by their own tickets.

**Creators** (replaces plain-text author/artist lists)
- A **Creator** is a person or group, global across all users. Fields: `name`, optional `sortName` (suggested as "Surname, Name" for book authors and without a leading "The" for artists), external IDs (Open Library author key, Discogs artist ID, MusicBrainz artist MBID).
- Users cannot rename a creator in the MVP. A typo is fixed by choosing or creating another creator on the item, so nobody corrupts other users' data.
- Matching order: by external ID on import, then autocomplete over existing creators (case- and diacritic-insensitive) on manual entry, and otherwise a new creator is created. No merge tool in the MVP.
- An item links to creators through **credits**: (creator, role, position). Roles are per item type: book → author, translator; vinyl → artist. A creator has at most one role per item. "Various Artists" is an ordinary creator.

**Book**
- `subtitle`, `publisher` (single, text), `year`, `language` (one ISO 639-1 code), `pageCount`, `series` + `volumeNumber`, `binding` (hardcover | paperback | other).
- Credits: authors and translators.
- External IDs: `isbn13` (ISBN-10 converted on save), Open Library edition ID and work ID, Google Books volume ID.

**Vinyl record**
- Credits: artists.
- `label` + `catalogueNumber` (one pair), `country` (ISO 3166), `year` (this pressing), `originalYear` (first release, from the master).
- Format: `discCount`, `size` (12" | 10" | 7"), `speed` (33⅓ | 45 | 78), `releaseKind` (album | EP | single | compilation), `reissue` (boolean), `formatNotes` (free text, e.g. "180 g, red vinyl, gatefold"). "LP" follows from size + speed and is not a separate value.
- External IDs: `barcode` (EAN/UPC), `discogsReleaseId`, `discogsMasterId` (may be set alone when the pressing is unknown), MusicBrainz release ID and release-group ID.
- **Not stored:** media/sleeve condition, tracklist.

Glossary terms added: **Consumed**, **Priority**, **Creator**.

## Comments

**2026-11-20, addendum from [UI brief and theme](20-ui-brief-and-theme.md).** The MVP UI supports **PLN only**: no currency select, and "Wartość zakupów" is a single amount. The currency column stays in the data model and API as decided here and is always `PLN`, so adding currencies after the MVP is a UI-only change with no migration.

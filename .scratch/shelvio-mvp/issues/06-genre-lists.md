# Genre lists and mapping

Type: grilling
Status: resolved
Blocked by: 01, 02, 19
Map: [Shelvio MVP](../map.md)

## Question

What are the controlled genre lists for books and for vinyl records, and how do genres or subjects from external APIs map onto them?

Decide:
- the source of each list: adopt an existing taxonomy (e.g. Discogs genres/styles for music, BISAC or a simplified one for books) or a hand-made list,
- whether lists are flat or two-level (genre → subgenre/style),
- whether users can extend a list or only the system can,
- how API values are mapped (automatic mapping table, suggest-and-confirm, or manual pick),
- (Translation mechanism settled by Translation approach: stable English slug as key, display names in the database, Polish only for now.)


## Answer

Resolved in a grilling session on 2026-11-20. No ADR (a list change is a migration); the glossary entry for **Genre** now says the list is single-level.

**Structure.** One flat list per item type, with no subgenres. The list is fixed by the system (not user-extensible); an item may have any number of genres, including none. There is no "Inne"/"Other" genre: browse filters get a "Bez gatunku" value instead, like "Bez półki".

**Vinyl records (20).** Based on the 15 Discogs genres, with "Folk, World, & Country" split into three and Metal and Punk split out of Rock:

| slug | Polish name | from Discogs |
|---|---|---|
| `rock` | Rock | Rock |
| `metal` | Metal | Rock + a metal style |
| `punk` | Punk | Rock + Punk / Hardcore / Oi style |
| `pop` | Pop | Pop |
| `jazz` | Jazz | Jazz |
| `blues` | Blues | Blues |
| `funk-soul` | Funk / Soul | Funk / Soul |
| `hip-hop` | Hip-hop | Hip Hop |
| `electronic` | Elektronika | Electronic |
| `classical` | Muzyka klasyczna | Classical |
| `folk` | Folk | Folk, World, & Country (default) |
| `world` | Muzyka świata | Folk, World, & Country + regional style |
| `country` | Country | Folk, World, & Country + Country / Bluegrass style |
| `reggae` | Reggae | Reggae |
| `latin` | Muzyka latynoamerykańska | Latin |
| `stage-screen` | Muzyka filmowa i teatralna | Stage & Screen |
| `childrens` | Dla dzieci | Children's |
| `brass-military` | Muzyka dęta i wojskowa | Brass & Military |
| `spoken-word` | Słowo mówione i słuchowiska | Non-Music |
| `sung-poetry` | Poezja śpiewana i piosenka aktorska | none (picked by hand) |

**Books (28).** A hand-made list modelled on Polish bookshop sections:

| slug | Polish name |
|---|---|
| `literary-fiction` | Literatura piękna |
| `contemporary-fiction` | Literatura obyczajowa |
| `romance` | Romans |
| `crime-thriller` | Kryminał, sensacja, thriller |
| `science-fiction` | Science fiction |
| `fantasy` | Fantasy |
| `horror` | Horror |
| `historical-fiction` | Powieść historyczna |
| `poetry` | Poezja |
| `drama` | Dramat |
| `comics` | Komiks |
| `children` | Literatura dziecięca |
| `young-adult` | Literatura młodzieżowa |
| `reportage` | Reportaż |
| `biography` | Biografia i wspomnienia |
| `essays` | Eseistyka |
| `history` | Historia |
| `popular-science` | Popularnonaukowa |
| `philosophy` | Filozofia |
| `religion` | Religia i duchowość |
| `psychology` | Psychologia |
| `society-politics` | Społeczeństwo i polityka |
| `business-economics` | Biznes i ekonomia |
| `self-help` | Poradniki i rozwój osobisty |
| `cooking` | Kulinaria |
| `travel` | Podróże |
| `art` | Sztuka |
| `music` | Muzyka |

**Mapping.** A mapping table in code, one per metadata source:
- Discogs genres/styles and MusicBrainz genres: exact name match onto a Shelvio slug (e.g. MusicBrainz "heavy metal" → `metal`).
- Open Library subjects and Google Books categories (free text): keyword rules over normalised text (lowercase, no diacritics), e.g. `fantast` → `fantasy`, `kryminal` / `detective` → `crime-thriller`.
- Discogs styles serve only to split broad genres. A deciding style replaces the general genre (Rock + Heavy Metal → `metal` only); `rock` is added as well only when the release also has plainly rock styles (e.g. Hard Rock). "Folk, World, & Country" without a deciding style → `folk`.
- Matches are preselected in the form as "sugerowany" and confirmed by the user. Unmatched values are dropped and written to server logs only (never the database), to grow the table. Source genre names are never stored (see [Third-party data licensing and attribution](19-third-party-data-licensing.md)).

**Maintenance.** A `genres` table (`slug`, `item_type`, Polish name, sort order, `retired` flag), seeded and changed only by migrations, with no admin UI. Genres are never deleted: a migration either merges one into another (repointing `item_genres`) or retires it (hidden from the picker; items keep it).

The UI brief's browse filters now include "Bez gatunku".

## Comments

**2026-11-20, input from [Third-party data licensing and attribution](19-third-party-data-licensing.md).** Discogs genres/styles (not CC0) and MusicBrainz genre tags (CC BY-NC-SA) may be used only as input to suggest Shelvio genres; their names are never stored, only Shelvio genre IDs. Adopting the Discogs genre/style taxonomy as our list is therefore a separate question from storing Discogs data: if considered, check it is acceptable to reuse the list itself. Open Library subjects and Google categories carry no such restriction.

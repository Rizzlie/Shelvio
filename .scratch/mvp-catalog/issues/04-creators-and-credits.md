# 04: Creators and credits

**What to build:** In the item form the Owner adds creators with a diacritic-insensitive autocomplete over existing creators, or creates a new one with "Utwórz „…”" and a suggested "Nazwa do sortowania", picks a role per credit and orders credits by dragging; the item page lists "Name · rola". See the spec's "Catalog: creators", "Data model" (`creators`, `item_credits`) and UI brief 3.5 section 2.

**Blocked by:** 03 (Edit and delete an item).

**Status:** ready-for-agent

- [ ] `creators` table (name, nullable sort name, search column over `lower(unaccent())` of name and sort name with a trigram index, three source-ID columns each partial-unique) and `item_credits` (PK `(item_id, creator_id)`, `UNIQUE (item_id, role, position)`, cascading with the item).
- [ ] `createItem`/`updateItem` accept credits as `{ creatorId }` or `{ newCreator: { name, sortName? } }` with a role, in order; names normalised (NFC, trimmed, whitespace collapsed); "Utwórz" always creates a new creator; roles per type (book: author, translator; vinyl: artist) → `item.roleNotAllowed`; the same creator twice → `item.creatorCreditedTwice`.
- [ ] `search_text` includes credited creators' names and sort names.
- [ ] `GET /creators?query=` returns at most 10, case- and diacritic-insensitive substring over name and sort name, prefix matches first.
- [ ] Form section Twórcy: rows with autocomplete, role select, drag handle, remove, "+ Dodaj twórcę"; last option "Utwórz „…”" with an inline editable "Nazwa do sortowania" suggested by a pure utility (book author "Nazwisko, Imię"; artist without a leading "The"); existing creators show no editable fields. Switching type in the add form resets roles invalid for the new type.
- [ ] Item page section Twórcy ("Name · rola"); the temporary list shows the first creator.
- [ ] Unit tests for the sort-name suggestion. Domain tests: credits create/replace, roles per type, duplicate creator refused, autocomplete by sort name ("tokarczuk, olga" finds "Olga Tokarczuk"), diacritics ignored, explicit "Utwórz" always new.
- [ ] E2E: add a book with an author and a translator (one new, one existing) and reorder them.

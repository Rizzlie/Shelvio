# 04: Search

**What to build:** The user types in the top-bar field "Szukaj po tytule, twórcy, ISBN…" and the current view narrows as they type, ignoring case and Polish diacritics ("swiat" finds "Dziwny jest ten świat"); a pasted ISBN or barcode finds exactly that item; pressing Enter on any other page opens "Wszystko" with the results. See the spec's "Text search" and "Frontend: screen" (top-bar search) and "Frontend: routes and URL state" (history while typing).

**Blocked by:** 01 (Browse tracer).

**Status:** ready-for-agent

- [ ] Migration: GIN `pg_trgm` index on `items.search_text`, partial on `deleted_at IS NULL`.
- [ ] `browseItems` `text`: split on whitespace, every word an `ILIKE '%word%'` substring of `search_text`, normalised with the same shared function Catalog uses to build it; `%`, `_` and `\` escaped; ≤ 200 chars.
- [ ] Code mode for 8–13 digits after removing hyphens and spaces (final `X` allowed): valid ISBN-10 converted to ISBN-13; exact match on `isbn13` or `barcode`; shorter digit strings searched as text.
- [ ] `q` parameter on `GET /browse/items`; search combines with the view's scope and keeps the chosen sort.
- [ ] Top-bar field: on browse routes shows and edits `q` with ~300 ms debounce, replacing the history entry while typing; elsewhere starts empty and Enter navigates to Wszystko with `q`. Also in the mobile top bar.
- [ ] Toolbar result count follows the search.
- [ ] Domain tests: "zolc" → "Żółć", words in any order, partial words, creator name and sort name, subtitle/series/publisher/label/catalogue number, notes and tags not matched, `%`/`_` literal, results updated after `creator:rename`; hyphenated ISBN-13, ISBN-10, barcode exact, partial code not matched by substring, "1984" as text.
- [ ] E2E: "swiat" finds "Dziwny jest ten świat"; a hyphenated ISBN finds its book; Enter on an item page opens Wszystko with results; Back after typing returns to the state before the search.

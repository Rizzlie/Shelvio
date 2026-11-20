# 07: Sorting

**What to build:** The user sorts by date added (default, newest first), title, creator, year, rating and priority, flips the direction with a toggle, and sees titles and creators in Polish alphabetical order with empty values always last. See the spec's "Sorting and paging" and "Frontend: screen" (toolbar).

**Blocked by:** 05 (URL state and the filter panel).

**Status:** ready-for-agent

- [ ] Migration: dedicated ICU collation `CREATE COLLATION IF NOT EXISTS … (provider = icu, locale = 'pl')`, used by title and creator sorts.
- [ ] `browseItems` sort fields `addedAt`, `title`, `creator` (primary credit's `sort_name`, else `name`, computed in the query), `year` (vinyl pressing year, else original year), `rating`, `priority` (wanted items only); `asc` / `desc`; empty values last in both directions; ties by `id` desc; keyset cursor works for every field.
- [ ] `GET /browse/items` parameters `sort` and `dir`.
- [ ] Toolbar sort select and direction toggle; changing the field resets the direction to its default (title and creator asc, others desc); `sort`/`dir` in the URL, omitted when equal to the preset's default.
- [ ] Domain tests: every field both directions, Ł after L and Ś after S, creator sort-name fallbacks and translator never primary, vinyl year fallback, empty last both ways, kept priority on owned items treated as empty, paging without duplicates or gaps for a non-default sort.
- [ ] Frontend unit test: default direction per field and URL omission.
- [ ] E2E: sort by title in Polish order and by creator; toggle direction.

# 22: Creator corrections and orphan creators

**What to build:** The operator fixes a misspelled creator with `creator:rename` and folds a duplicate into another with `creator:merge`, each after a summary and confirmation; creators no item credits any more disappear after a day. See the spec's "Catalog: creators" and map ticket 26.

**Blocked by:** 04 (Creators and credits).

**Status:** ready-for-agent

- [ ] Catalog operations `summariseCreator`, `renameCreator` (name and/or sort name; refreshes `search_text` of every credited item, soft-deleted included) and `mergeCreators` (one transaction: credits repointed; where an item credits both, the survivor's credit kept, the other dropped and positions within that item's roles renumbered without gaps; missing source IDs copied; different IDs from the same source → `Conflict`; merged creator hard-deleted; `search_text` refreshed on affected items, soft-deleted included; `updated_*` untouched).
- [ ] Nx targets `creator:rename <id>` (options for the new name and sort name) and `creator:merge <survivor> <merged>` on the API, in the style of `delete-account`: boot without HTTP, print the summary (names, IDs, source IDs, number of credited items), ask for confirmation.
- [ ] Daily orphan-creator job: deletes creators with no credits at all (credits on soft-deleted items count) created more than 24 h ago.
- [ ] Domain tests: rename refreshes search text; merge repointing, both-credited case and renumbering, IDs combined, conflict refused, merged creator gone, `updated_*` untouched; orphan job with a fake clock (kept before 24 h, kept when credited only by a soft-deleted item, removed otherwise).

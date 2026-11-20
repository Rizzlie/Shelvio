# 12: Back navigation and stale links

**What to build:** Returning with Back from an item page restores the list exactly where the user left it, and bookmarked or shared browse links keep opening even when a shelf, tag or collection in them no longer exists or an option is not available to the user. See the spec's "Frontend: routes and URL state" (normalisation, store memory).

**Blocked by:** 05 (URL state and the filter panel).

**Status:** ready-for-agent

- [ ] The browse store keeps the loaded pages and scroll position of the last browse URL in memory and restores them on Back; any item mutation in the app (add, edit, delete, move, "Mam to", photo) clears that memory.
- [ ] Normalisation drops every unusable value covered by the spec (invisible collections, unknown shelves and tags, unavailable purchase options, status on the wishlist) and rewrites the URL with `replaceUrl`, never showing an error.
- [ ] Frontend unit tests: store memory restored for the same URL and cleared by a mutation signal; full normalisation table.
- [ ] E2E: scroll past the first page, open an item, Back returns to the same position; after editing an item, Back shows the updated card; a bookmarked URL with a deleted shelf opens without it.

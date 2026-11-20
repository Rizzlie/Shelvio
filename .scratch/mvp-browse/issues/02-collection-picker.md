# 02: Collection picker

**What to build:** Next to the title a multi-select picker shows which collections are on screen ("Wszystkie kolekcje (2)", a collection's name, or "N kolekcje") and lets the user choose any subset; picking several on a collection page moves to "Wszystko", and cards then show their collection name. See the spec's "Frontend: routes and URL state" (collection preset) and "Frontend: screen" (header, picker).

**Blocked by:** 01 (Browse tracer).

**Status:** ready-for-agent

- [ ] Picker lists `listVisibleCollections`; at least one collection always stays selected.
- [ ] Label: "Wszystkie kolekcje (N)" when the selection equals all visible collections, the name when exactly one, otherwise an ICU plural "N kolekcje".
- [ ] Selection lives in the URL as repeatable `collection`; omitted when it equals the preset's default.
- [ ] On the collection route, any other selection navigates to Wszystko keeping the rest of the state; selecting exactly one collection on Wszystko shows its name as title and the collection header.
- [ ] Collection names on cards appear only when more than one collection is selected.
- [ ] Collections in the URL that are not visible are dropped on load (URL rewritten with `replaceUrl`).
- [ ] Frontend unit tests: picker label, URL ↔ selection round trip with defaults omitted, invisible IDs dropped.
- [ ] E2E: picker from one collection to both moves to Wszystko and shows collection names on cards; back to one collection hides them.

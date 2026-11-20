# 19: "O aplikacji" page

**What to build:** Anyone, signed in or not, can open a public "O aplikacji" page with the Discogs non-affiliation notice, credits to the metadata sources and a contact for rights holders, reachable from the sign-in screen and the sidebar. See the spec's "Frontend shell" and ADR-0004.

**Blocked by:** 12 (Sign-in screens (frontend)), 17 (App shell).

**Status:** ready-for-agent

- [ ] A public route (no sign-in needed) with the Discogs non-affiliation notice, credits to Biblioteka Narodowa, e-ISBN, Open Library, MusicBrainz and Cover Art Archive, and a contact address for rights holders taken from frontend build configuration.
- [ ] A small "O aplikacji" link under the sign-in card and in the sidebar's account area.
- [ ] All text via Transloco in its own lazy scope; follows the stored or system theme mode; works at desktop and 390 px.
- [ ] E2E: the page is reachable signed out from the sign-in screen and signed in from the sidebar.

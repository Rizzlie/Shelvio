# 01: Shares and the role matrix

**What to build:** Collections can be shared with other users as Contributor or Viewer, and every existing access answer now depends on the actor's role. With the seeded Shares, `contributor` and `viewer` sign in and see "Dom" under "Udostępnione mi" with their role chip, in "Wszystko" and in the collection picker, and the collection header shows "Właściciel: <name>". A role that is too weak gets 403 `access.insufficientRole`; no access is still 404. See the spec's "Data model", "Permission matrix (role resolution)", "Contracts and visibility" (error codes), "Frontend" (sidebar, browse header) and "E2E seed".

**Blocked by:** every ticket in `mvp-browse` (../../mvp-browse/issues/); nothing else in this spec.

**Status:** ready-for-agent

- [ ] `collection_shares` (PK `(collection_id, user_id)`, `role` text + `CHECK` from a shared Zod const, `invited_by_user_id`, timestamps, FK to `collections` `ON DELETE CASCADE`) and `collection_invitations` (UUIDv7, lowercased `email`, `role`, `invited_by_user_id`, timestamps, `UNIQUE (collection_id, email)`, cascading FK) in one migration.
- [ ] Role resolution in Collections & Access: `owner` by `owner_user_id`, else the Share's role, else none; a soft-deleted collection gives none to everyone.
- [ ] The matrix answers `collection:view`, `people:view` (new), `item:edit`, `organisation:manage`, `collection:manage`, `collection:leave` (new) and `canSeePurchaseDetails` per role exactly as in the spec's table.
- [ ] `assertCan`: no role → `NotFound`; a role without the action → `Forbidden` `access.insufficientRole` (params `action`), with a Polish translation in the shared error scope.
- [ ] `listCollectionsWhere(actor, action)` and `listVisibleCollections(actor)` include collections reached through Shares, with `role`, `owner: { id, name }` and role-specific `permissions`; owner names via Identity's `getProfiles` (new, or reused if `mvp-browse` added one). Identity also gains `findUserByEmail` (used from ticket 04).
- [ ] Listing shelves and tags needs `collection:view`; their mutations keep `organisation:manage`.
- [ ] Sidebar: "Udostępnione mi" lists non-owned visible collections, Polish-collated, with a role chip ("Współtwórca" / "Obserwator") and the owner's name as tooltip and accessible description; the heading is hidden when empty. The collection list reloads on navigation to a browse route, so a new Share appears without signing in again.
- [ ] Browse header shows "Właściciel: <name>" for collections the actor doesn't own, next to the role chip.
- [ ] E2E seed: a Contributor Share for `contributor` and a Viewer Share for `viewer` to "Dom".
- [ ] Domain tests (real Postgres, real Share rows): role resolution, every matrix cell through `assertCan`, outsider `NotFound`, a soft-deleted collection hiding its Shares, `listVisibleCollections` roles / owner / permissions, `listCollectionsWhere` per action.
- [ ] HTTP adapter test: 404 for no access vs 403 `access.insufficientRole` as `problem+json` on a representative mutating endpoint per module.
- [ ] Frontend unit test: sidebar split into "Moje kolekcje" / "Udostępnione mi".
- [ ] E2E: `contributor` and `viewer` each see "Dom" under "Udostępnione mi" with the right chip and open it with the owner's name in the header.

# 01: Collections

**What to build:** A signed-in user creates a collection from "+ Nowa" in the sidebar, sees their collections under "Moje kolekcje", opens one to a temporary collection page, and as its Owner renames it or deletes it in "Ustawienia kolekcji" → "Ogólne". Nobody else can see it. See the spec's "Collections & Access behaviour", "Data model" (`collections`), "Frontend" (shell slots, temporary collection page, "Ustawienia kolekcji") and "E2E seed".

**Blocked by:** every ticket in `mvp-foundations` (../../mvp-foundations/issues/); nothing else in this spec.

**Status:** ready-for-agent

- [ ] Collections & Access `domain` and `feature` libraries; `collections` table (UUIDv7, `owner_user_id`, trimmed `name` 1–80 chars, timestamps, `deleted_at`, `deleted_by_user_id`, partial normal-read indexes).
- [ ] Operations `createCollection`, `renameCollection`, `deleteCollection` (soft), `getCollection`, `listCollections(actor)` (Polish-collated by name), `assertCan(actor, collectionId, action)` and `listCollectionsWhere(actor, action)` over a closed set of actions, plus `canSeePurchaseDetails`; in this spec only the Owner has access; no access or a deleted collection → `NotFound`.
- [ ] REST: `GET/POST /collections`, `GET/PATCH/DELETE /collections/{id}`.
- [ ] Sidebar "Moje kolekcje" lists the user's collections with "+ Nowa"; the "Nowa kolekcja" dialog (one "Nazwa" field, "Utwórz") lands on the new collection.
- [ ] Temporary collection page on the collection route: title, the user's role, a settings link, a "Dodaj" button (wired in ticket 02) and the empty state "Ta kolekcja jest pusta" with "Dodaj pierwszą pozycję".
- [ ] "Ustawienia kolekcji" with the "Ogólne" tab: "Nazwa kolekcji" + "Zapisz"; danger block "Usuń kolekcję" with the brief's text and a confirmation requiring the exact name; afterwards the user lands on the signed-in landing route.
- [ ] An unknown, deleted or someone else's collection shows the "Nie znaleziono" screen.
- [ ] The e2e seed adds collection "Dom" owned by `owner`.
- [ ] Domain tests (real Postgres): create, rename, soft delete hides the collection from every operation, non-owner and deleted → `NotFound`, `listCollectionsWhere` returns the Owner's collections.
- [ ] E2E: `owner` creates, renames and deletes a collection; `contributor` opening its URL sees "Nie znaleziono".

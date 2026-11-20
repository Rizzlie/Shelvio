# 06: Change roles and remove access

**What to build:** On the "Osoby" tab the Owner changes a person's role with a select (Współtwórca / Obserwator) and takes access away with "Odbierz dostęp" after a confirmation. The removed person loses the collection at once and sees "Nie znaleziono" when opening it; everything they added stays. See the spec's "Collections & Access operations" (`changeShareRole`, `removeShare`), "REST endpoints" and "Frontend" (Owner's "Osoby" tab).

**Blocked by:** 04 (Invite an existing user).

**Status:** ready-for-agent

- [ ] `changeShareRole` and `removeShare` (hard delete) require `collection:manage`; an unknown Share → `NotFound`; changing to the current role is a no-op success.
- [ ] REST: `PATCH /collections/{id}/shares/{userId}`, `DELETE /collections/{id}/shares/{userId}`.
- [ ] Owner's "Osoby" rows: role select saved on change (snackbar "Zmieniono rolę"); "Odbierz dostęp" with the dialog "Odebrać dostęp osobie <name>?" ("Anuluj" / "Odbierz dostęp"), snackbar "Odebrano dostęp".
- [ ] Domain tests: a role change takes effect in `assertCan` and `canSeePurchaseDetails`; after removal the collection is `NotFound` for that user and its items, shelves, tags and photos are unchanged; Contributor and Viewer refused with `access.insufficientRole`.
- [ ] E2E (a test-created collection): `owner` changes `viewer`'s Share to Współtwórca and `viewer` now sees edit actions; `owner` removes the Share and `viewer` opening the collection sees "Nie znaleziono".

# 07: Read-only people list and leaving a collection

**What to build:** Contributors and Viewers see who has access. Viewers open a read-only dialog from an "Osoby" link in the collection header; Contributors get a read-only "Osoby" tab next to "Półki i tagi". Both show the Owner as "Właściciel", every person with avatar, name and role, "(Ty)" on themselves, no emails, and the note "Tylko właściciel zarządza dostępem.". Under the list, "Opuść kolekcję" removes their Share after a confirmation and lands them on "Wszystko". See the spec's "Frontend" (read-only people view, browse header) and `leaveCollection`.

**Blocked by:** 03 (Contributor manages items and organisation), 04 (Invite an existing user).

**Status:** ready-for-agent

- [ ] `leaveCollection(actor, collectionId)` deletes the actor's Share; the Owner gets `share.ownerCannotLeave` (Polish translation); no access → `NotFound`. REST `POST /collections/{id}/leave`.
- [ ] One shared read-only people component, used by the Viewer's "Osoby" dialog (with "Zamknij") and the Contributor's "Osoby" tab.
- [ ] The browse header shows the "Osoby" link when the actor has neither `manageCollection` nor `manageOrganisation`.
- [ ] "Opuść kolekcję" with the dialog "Opuścić kolekcję „<nazwa>”? Stracisz do niej dostęp." ("Anuluj" / "Opuść"); afterwards the app navigates to "Wszystko", reloads the collections and shows the snackbar "Opuszczono kolekcję „<nazwa>”".
- [ ] Domain tests: leaving as Contributor and as Viewer, after which the collection is `NotFound` for them and its contents are unchanged; the Owner refused.
- [ ] E2E: `viewer` on "Dom" opens "Osoby" and sees "(Ty)", no emails and the note; `contributor` sees the read-only "Osoby" tab; `viewer` leaves a test-created collection and lands on "Wszystko" without it.

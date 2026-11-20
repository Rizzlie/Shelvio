# 04: Invite an existing user

**What to build:** The Owner opens "Ustawienia kolekcji" → "Osoby" and sees the people list: the Owner row "Właściciel", then each person with avatar, name, email and role. They press "Zaproś osobę", type the email of someone who already has a Shelvio account and pick a role. That person gets a Share at once, and the dialog shows "Dostęp nadany" with a copyable Polish message linking to the collection. "Zaproś osoby" in the empty-collection state opens the same dialog. See the spec's "Collections & Access operations" (`inviteToCollection`, `listPeople`), "Contracts and visibility", "REST endpoints" and "Frontend" ("Osoby" tab, invite dialog).

**Blocked by:** 01 (Shares and the role matrix).

**Status:** ready-for-agent

- [ ] `inviteToCollection(actor, collectionId, { email, role })` requires `collection:manage`; the email is trimmed and lowercased with no Gmail normalisation; `share.selfInvite`, `share.alreadyShared` and `invitation.alreadyInvited` (Conflict, with Polish translations); an existing user found by `findUserByEmail` gets a Share with `invited_by_user_id`, outcome `shared`; unique-constraint races map to the same codes. (The `invited` outcome and its UI come in ticket 05.)
- [ ] `listPeople` requires `people:view`: Owner first, then Shares Polish-collated by name, `isMe`, `email` only when the actor is the Owner.
- [ ] REST: `POST /collections/{id}/invitations`, `GET /collections/{id}/people`.
- [ ] The Owner's "Osoby" tab: primary "Zaproś osobę"; the Owner row without controls; Share rows with avatar (initials fallback), name, email and role.
- [ ] Dialog "Zaproś osobę": step 1 with "E-mail", the role radio with the brief's descriptions, Obserwator preselected, "Zaproś", and errors keyed by code ("Podaj poprawny adres e-mail" for an invalid email); step 2 with "Dostęp nadany", the read-only message, "Kopiuj wiadomość" turning into "Skopiowano" (the text is selected when the clipboard is unavailable), "Zamknij" and the note "Nie wysyłamy e-maili — prześlij wiadomość samodzielnie."; closing refreshes the list.
- [ ] The message is built by a pure function: "Cześć! Udostępniam Ci moją kolekcję „{name}” w Shelvio. Zaloguj się przez Google adresem {email}: {link}", with the link = the app's origin + the existing collection route, no token.
- [ ] The browse empty-collection state shows "Zaproś osoby" for the Owner, opening the dialog.
- [ ] Domain tests: normalisation; dots and `+alias` distinct; a Share created for an existing user; the three Conflict codes; Contributor and Viewer → `Forbidden`; outsider → `NotFound`; people list order, `isMe`, emails only for the Owner.
- [ ] HTTP adapter test: invitation validation (invalid email, unknown role); the people response without emails for non-Owners.
- [ ] Frontend unit test: the message builder.
- [ ] E2E: `owner` creates a collection, invites the `viewer` account's email as Obserwator, sees "Dostęp nadany" and copies the message; `viewer` then sees the collection under "Udostępnione mi".

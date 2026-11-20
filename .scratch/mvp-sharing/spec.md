# MVP sharing: Shares, Invitations, roles and the people list

Status: ready-for-agent
Spec: 4 of 4 for the Shelvio MVP (after `mvp-foundations`, `mvp-catalog` and `mvp-browse`, all assumed fully implemented)
Map: [Shelvio MVP](../shelvio-mvp/map.md)
Builds on: [MVP foundations](../mvp-foundations/spec.md) (Identity, sign-in and the admission gate, the account-hooks interface with its no-op `isInvited` / `afterSignIn`, operator account deletion, the app shell's "Udostępnione mi" slot, the e2e stack with the synthetic `owner` / `contributor` / `viewer` / `invited` / `outsider` accounts), [MVP catalog](../mvp-catalog/spec.md) (Collections & Access with `assertCan`, `listCollectionsWhere`, `canSeePurchaseDetails` and the closed action set; Catalog operations that already call them; "Ustawienia kolekcji" with "Ogólne" and "Półki i tagi"; the item page; account deletion of owned collections) and [MVP browse](../mvp-browse/spec.md) (`listVisibleCollections` with `role` and `permissions`, `resolveCollectionScope` with the `editable` wishlist scope, the purchase-detail rule in `browseItems` / `summariseItems`, the single-collection header, empty states).
Sources: map tickets [09 Invitation flow](../shelvio-mvp/issues/09-invitation-flow.md) and [10 Permission matrix](../shelvio-mvp/issues/10-permission-matrix.md); for the gate, seeded accounts and deletion [08 Authentication and sessions](../shelvio-mvp/issues/08-authentication.md), [23 Sign-in for local development and e2e tests](../shelvio-mvp/issues/23-dev-and-e2e-sign-in.md), [25 Account lifecycle](../shelvio-mvp/issues/25-account-lifecycle.md); ADR-0001 to ADR-0005 (incl. the ADR-0003 amendment); [UI README](../shelvio-mvp/ui/README.md), [UI brief](../shelvio-mvp/ui/ui-brief.md) (sections 0, 1, 2, 3.1, 3.3, 3.6, 3.7); mockups `screens/07`, `08`, `15`, `16`.

## Problem Statement

After the first three specs, Shelvio is a private notebook: every collection has exactly one person with access, its Owner. The whole point of the app, keeping collections "with friends", is missing. An Owner cannot let their partner add records to the shared vinyl collection, cannot show a friend their library without also showing what they paid, and cannot invite someone who has no Shelvio account yet. Because Shelvio is invite-only, a friend who is not on the operator's allowlist cannot even get in. The sidebar's "Udostępnione mi" section is an empty slot, the people and invitations tabs in collection settings don't exist, and the "Zaproś osoby" and "Osoby" entry points the UI brief promises are absent.

Everything built so far already asks Collections & Access "may this actor do this?", but the only answer it knows is "yes, you are the Owner" or "no, this doesn't exist". The Contributor and Viewer roles, the `403` refusal for a role that is too weak, purchase details hidden from Viewers, and the widening of add targets, move targets, the duplicate scope, the visible collections and the wishlist to shared collections are all waiting for real Shares.

## Solution

An Owner shares a collection by email, without Shelvio sending any email:

- In "Ustawienia kolekcji" → "Osoby" the Owner presses "Zaproś osobę", types a Google account email and picks **Współtwórca** or **Obserwator**. If someone with that email already has a Shelvio account, they get a **Share** at once ("Dostęp nadany"); otherwise an **Invitation** is saved ("Zaproszenie zapisane"). Either way the Owner gets a ready-made Polish message with a plain link to the collection and a "Kopiuj wiadomość" button, and sends it however they like.
- There is no accept or decline step. An Invitation lets its email past the invite-only gate and, on every sign-in with that email, becomes a Share. The invited person opens the link, signs in with Google and lands straight in the collection.
- Shared collections appear under **"Udostępnione mi"** in the sidebar with a role chip, and everywhere the browse screen, the wishlist picker, "Dodaj pozycję" and "Przenieś" already list collections.
- A **Contributor** adds, edits, moves and removes items, manages photos, shelves and tags, sees purchase details, and has a settings page with "Półki i tagi" and a read-only "Osoby" tab. A **Viewer** browses everything except purchase details, with no actions at all, and opens a read-only "Osoby" dialog from the collection header. Both see who has access (avatar, name, role) and can leave the collection.
- The Owner sees everyone's email, changes roles, takes access away, and in "Zaproszenia" sees pending Invitations, changes their role or revokes them. Invitations never expire.
- Opening a collection or item without access shows the generic "Nie znaleziono" screen together with the email the person is signed in with and a way to sign in with another account, so a friend who used the wrong Google account can fix it. A role that is too weak gets a translated refusal; the UI hides what the backend would refuse.
- Deleting an account now also removes the person's Shares; the operator's summary lists who had access to their collections.

## User Stories

### Inviting

1. As an Owner, I want a primary "Zaproś osobę" button on the "Osoby" tab of "Ustawienia kolekcji", so that sharing starts where I manage access.
2. As an Owner, I want "Zaproś osoby" in the empty state of my empty collection, so that I can share a new collection straight away.
3. As an Owner, I want the invite dialog to ask only for an email and a role, so that inviting takes seconds.
4. As an Owner choosing a role, I want each option described ("Współtwórca — może dodawać, edytować i usuwać pozycje oraz zarządzać półkami i tagami" / "Obserwator — może tylko przeglądać; nie widzi cen ani dat zakupu"), so that I know what I'm granting.
5. As an Owner, I want Obserwator preselected, so that I never grant more than I meant to by accident.
6. As an Owner typing an email with capital letters or surrounding spaces, I want it trimmed and lowercased, so that "Ola.Wrobel@Example.com " and "ola.wrobel@example.com" are the same person.
7. As an Owner, I want an invalid email refused with a clear message, so that I fix a typo before saving.
8. As an Owner inviting someone who already has a Shelvio account, I want them to get access immediately and to see "Dostęp nadany", so that they can open the collection right now.
9. As an Owner inviting an email with no Shelvio account, I want an Invitation saved and to see "Zaproszenie zapisane" with "Dostęp pojawi się po pierwszym zalogowaniu tym adresem", so that I know what will happen.
10. As an Owner, I want, after inviting, a read-only Polish message with the collection's name, the invited email and a plain link to the collection, so that I can send it by any messenger.
11. As an Owner, I want a "Kopiuj wiadomość" button that turns into "Skopiowano", so that I know the message is on my clipboard.
12. As an Owner whose browser blocks clipboard access, I want the message text selectable, so that I can still copy it by hand.
13. As an Owner, I want the note "Nie wysyłamy e-maili — prześlij wiadomość samodzielnie.", so that I don't wait for an email that never comes.
14. As an Owner trying to invite myself, I want a clear refusal, so that I don't create a meaningless Share.
15. As an Owner inviting an email that already has a Share or an Invitation in this collection, I want a refusal telling me to change the role instead, so that one person never has two entries.
16. As an Owner, I want Gmail dots and "+alias" addresses treated as distinct emails, so that Shelvio never guesses who someone is.
17. As an Owner, I want the "Osoby" and "Zaproszenia" lists to show the new entry as soon as I close the dialog, so that I see the result.

### Being invited and getting access

18. As an invited person with no account, I want my Invitation to let me past the invite-only gate on my first sign-in, so that I don't need to be on the operator's allowlist.
19. As an invited person opening the link from the message while signed out, I want to sign in with Google and land straight in that collection, so that I don't have to look for it.
20. As an invited person, I want access without accepting anything, so that there is no extra step.
21. As a person invited to several collections before signing up, I want all of them to become mine on my first sign-in, so that nothing is left pending.
22. As an existing user whose Google email changed to an address that had Invitations, I want them converted on my next sign-in, so that access follows my current email.
23. As an existing user invited by email, I want the collection to appear in my sidebar the next time the app loads my collections, so that I don't have to sign in again.
24. As a person whose Google account uses a different email than the one invited, I want the usual "Shelvio działa na zaproszenia" screen rather than a guess, so that access only goes to the address the Owner chose.
25. As a person invited to a collection that the Owner has since deleted, I want that Invitation to neither let me in nor give me anything, so that a deleted collection stays gone.
26. As a signed-in person opening a collection or item link I have no access to, I want "Nie znaleziono — ta kolekcja lub pozycja nie istnieje albo nie masz do niej dostępu." with the email I'm signed in with and "Zaloguj innym kontem", so that I notice I used the wrong account and can switch.
27. As a person without access, I want the collection's name never shown, so that nothing about a collection leaks to people who aren't in it.
28. As a person choosing "Zaloguj innym kontem", I want to be signed out, offered Google's account chooser and brought back to the same link, so that switching takes one step.

### "Udostępnione mi" and shared collections everywhere

29. As a user with shared collections, I want them listed under "Udostępnione mi" in the sidebar (in the drawer on mobile), in Polish alphabetical order, so that I find them quickly.
30. As a user, I want each shared entry to carry a small role chip ("Współtwórca" or "Obserwator"), so that I know what I may do there.
31. As a user with no shared collections, I want no empty "Udostępnione mi" heading, so that the sidebar stays quiet.
32. As a user, I want shared collections included in "Wszystko" and the collection picker, so that I browse everything I can see in one place.
33. As a user opening a shared collection, I want its header to show the owner's name and my role, so that I know whose collection it is.
34. As a Contributor, I want the header's settings link, so that I can manage shelves and tags.
35. As a Viewer, I want an "Osoby" link in the header instead of a settings link, so that I can see who has access.
36. As a user, I want my wishlist to include collections where I'm a Contributor by default, so that our shared wishes are on my list.
37. As a user, I want my wishlist to exclude collections where I'm only a Viewer by default, so that a friend's wishes aren't mixed with mine, and to be able to add them through the picker, so that I can look for a gift.
38. As a user browsing my own and shared collections together, I want each card to show its collection name, so that I know where an item belongs.

### Contributor

39. As a Contributor, I want to add items to the shared collection from "Dodaj pozycję", so that we build the collection together.
40. As a Contributor, I want the shared collection offered in "Do kolekcji" next to my own, so that I choose where the item goes.
41. As a Contributor, I want "Dodaj" preselected with the shared collection when I'm looking at it, so that items land where I was.
42. As a Contributor, I want to edit and delete any item in the collection, not only those I added, so that we keep the collection tidy together.
43. As a Contributor, I want to upload, replace and remove the photo on any item, so that every item can look like itself.
44. As a Contributor, I want "Mam to" on wanted items in the collection, so that I can record a purchase for us.
45. As a Contributor, I want to create, rename and delete shelves and tags in "Półki i tagi" and from the item form, so that I can organise the collection.
46. As a Contributor, I want to move an item between any two collections where I'm Owner or Contributor, so that I can reorganise across our collections.
47. As a Contributor, I want "Przenieś" to list only collections where I may edit items, so that I'm never offered a target the move would fail for.
48. As a Contributor, I want the duplicate notice to warn me about copies in shared collections where I'm a Contributor, so that we don't record a copy twice.
49. As a Contributor, I want to see purchase details and "Wartość zakupów" for the collection, so that I know what we paid.
50. As a Contributor, I want price sorting and filtering in the shared collection, so that I can work with prices as the Owner can.
51. As a Contributor, I want a settings page with only "Półki i tagi" and a read-only "Osoby", so that I see exactly what I may do.
52. As a Contributor, I want no "Ogólne" or "Zaproszenia" tab and no rename or delete, so that collection-level decisions stay with the Owner.
53. As a Contributor, I want nothing shown about who added or changed an item, so that sharing doesn't feel like surveillance (ticket 21).

### Viewer

54. As a Viewer, I want to browse every item, including wanted items with priority, notes, genres, tags, shelves and photos, so that I see the whole collection.
55. As a Viewer, I want no "Edytuj", "Przenieś", "Usuń" or "Mam to" anywhere (and no "⋮" menu on mobile), so that I'm never offered something that would fail.
56. As a Viewer, I want no purchase card, price or purchase date on item pages, cards or list rows, not even a locked placeholder, so that the Owner's spending stays private (UI brief rule 11).
57. As an Owner, I want purchase details removed from what the server sends a Viewer, not just hidden on screen, so that they can't be read in the browser's developer tools or by a future MCP client.
58. As a Viewer, I want no price or purchase-date sort or filter whenever a Viewer collection is selected, so that ordering by price can't leak it.
59. As a Viewer with my own collections too, I want "Wartość zakupów" computed over my own collections only, with a small note naming the excluded ones, so that the total is honest.
60. As a Viewer with only Viewer collections in view, I want "Wartość zakupów" absent, so that I'm not shown a meaningless total.
61. As a Viewer, I want my Viewer collections never offered in "Do kolekcji" or "Przenieś", so that I'm not invited to change someone else's collection.
62. As a Viewer with no collection I may edit, I want "Dodaj" to ask me to create my own collection first, so that adding still works for me.
63. As a Viewer, I want the duplicate notice to ignore collections I only view, so that a friend's copy doesn't look like mine.
64. As a Viewer, I want the item page to show the collection with my "Obserwator" chip, so that I know why there are no actions.
65. As a Viewer opening the settings URL of a Viewer collection, I want to be taken to the collection instead, so that I never see an empty or broken settings page.
66. As a Viewer, I want shelf and tag filters on the shared collection, so that I can browse it by shelf.

### The people list

67. As anyone with access, I want to see who has access to the collection: the Owner first marked "Właściciel", then each person with avatar, name and role, so that I know who sees my contributions.
68. As a non-Owner, I want my own row marked "(Ty)", so that I find myself in the list.
69. As a non-Owner, I want the note "Tylko właściciel zarządza dostępem.", so that I know whom to ask for changes.
70. As a person with access, I want other people's emails shown only to the Owner, so that my email isn't handed to everyone in a shared collection.
71. As a Viewer, I want the people list in a read-only "Osoby" dialog with "Zamknij", so that I can check it without a settings page.
72. As a Contributor, I want the same read-only list on the "Osoby" tab of my settings page, so that it sits next to "Półki i tagi".
73. As a person whose Google account has no avatar, I want my initials shown instead, so that every row has a picture.
74. As a non-Owner, I want pending Invitations hidden from me, so that emails of people who haven't joined don't leak.

### Managing access (Owner)

75. As an Owner, I want the "Osoby" tab to list the Owner row without controls and each other person with avatar, name, email and role, so that I see everyone at a glance.
76. As an Owner, I want to change a person's role with a select (Współtwórca / Obserwator), so that I can grant or reduce rights without re-inviting.
77. As an Owner, I want "Odbierz dostęp" with a confirmation, so that I don't remove someone by accident.
78. As an Owner who removed someone, I want the collection to disappear for them at once, without any notification, so that access ends cleanly.
79. As an Owner, I want items, photos, shelves and tags added by a removed Contributor to stay, so that the collection doesn't lose anything.
80. As an Owner, I want a "Zaproszenia" tab listing pending Invitations with email and a role select, so that I can adjust them before the person signs in.
81. As an Owner, I want "Cofnij zaproszenie" on each Invitation, so that I can withdraw one sent to the wrong address.
82. As an Owner with no pending Invitations, I want "Brak oczekujących zaproszeń", so that the empty tab is clear.
83. As an Owner, I want Invitations never to expire, so that a friend who signs up months later still gets access.
84. As an Owner, I want the Invitation's role and my "invited by" kept when it becomes a Share, so that converting changes nothing I chose.
85. As an Owner, I want a snackbar after each change (role changed, access removed, invitation revoked) without "Cofnij", so that I know it worked (UI brief rule 9).
86. As an Owner deleting a shared collection, I want it to disappear for everyone with access, so that the warning in "Ogólne" is true.
87. As an Owner, I want Invitations to a deleted collection to stop working, so that nobody gets in through a collection I removed.

### Leaving

88. As a Contributor or Viewer, I want an "Opuść kolekcję" button under the people list, so that I can drop a collection I no longer want.
89. As a person leaving, I want a confirmation naming the collection, so that I don't leave by accident.
90. As a person who left, I want to land on "Wszystko" with a snackbar and the collection gone from my sidebar, so that the result is visible.
91. As an Owner, I want people who leave to take nothing with them, so that their contributions stay in the collection.
92. As a person who left, I want to be able to get access again only by being invited again, so that leaving is meaningful.
93. As an Owner, I want no "leave" option for myself, so that a collection never ends up without an Owner (ownership transfer is out of scope).

### Refusals

94. As a user with too weak a role who still reaches a refused action (e.g. an old tab), I want a translated refusal message, so that I understand the action isn't allowed for my role.
95. As a user, I want collections and items I have no access to answered as not found, so that their existence is never revealed.
96. As a user whose access was removed while I had the collection open, I want my next action to show "Nie znaleziono", and bookmarked browse links to quietly drop that collection, so that nothing breaks.

### Account deletion (operator)

97. As the operator deleting an account, I want the summary to list, per owned collection, how many people have access and how many Invitations are pending, and how many Shares the person has in other collections, so that I see who will be affected.
98. As a person whose account was deleted, I want my Shares in other people's collections removed, so that no trace of my access stays.
99. As an Owner whose Contributor's account was deleted, I want the items they added to stay, so that the collection is untouched.
100. As a person whose account was deleted and who is invited again, I want the Invitation to let me in as a brand-new user, so that the normal path works.

### Developer and future MCP

101. As a developer, I want every permission answer to come from one role-based matrix inside Collections & Access, so that REST and the future MCP server can't disagree.
102. As a developer, I want `inviteToCollection` and the other access operations to be plain domain operations receiving the acting user, so that the MCP server can call them later.
103. As a developer, I want the e2e seed to give `contributor` and `viewer` Shares and `invited` an Invitation on the seed collection, so that role tests start from a known state.
104. As a developer, I want role tests to use real Shares, never fakes of our own modules, so that the refusal paths deferred by earlier specs are tested for real.

## Implementation Decisions

### Hand-offs from the earlier specs (all covered here)

Every item the earlier specs left to `mvp-sharing`, and where this spec covers it:

| From | Hand-off | Covered in |
|---|---|---|
| foundations | `isInvited(email)` no-op → a pending Invitation opens the admission gate (foundations story 6) | Account hooks |
| foundations | `afterSignIn(user)` no-op → convert Invitations into Shares on every sign-in | Account hooks; Conversion |
| foundations | `summariseAccount` lines for "people with access" | Account hooks |
| foundations | `deleteAccountData` removes the user's Shares | Account hooks |
| foundations | the shell's empty "Udostępnione mi" slot | Frontend: sidebar |
| foundations | seed: Shares for `contributor` and `viewer`, Invitation for `invited` | E2E seed |
| foundations | account-hooks tests extended (Invitation opens the gate and converts, Shares deleted) | Testing seam 1 |
| foundations | `Forbidden` refusal with a translated message (story 28), first reachable now | Errors |
| catalog | Contributor and Viewer answers in `assertCan`; `Forbidden` reachable | Permission matrix |
| catalog | `canSeePurchaseDetails` false for Viewers; purchase details stripped from item responses | Permission matrix; Contracts |
| catalog | Contributor collections as add targets, move targets ("Przenieś" widened to Contributor in both) and in the duplicate scope, via `listCollectionsWhere` | Permission matrix |
| catalog | item page actions "for those allowed (always the Owner here)" → per role | Frontend: item page |
| catalog | "Osoby" and "Zaproszenia" settings tabs; Contributor settings variant | Frontend: collection settings |
| catalog | read-only people dialog; invite dialog | Frontend: people dialog; invite dialog |
| catalog | "Udostępnione mi" | Frontend: sidebar |
| catalog | converting Invitations on sign-in; deleting Shares on account deletion | Account hooks |
| catalog | `hardDeleteOwnedCollections` also removes the collections' Shares and Invitations | Data model (FK cascade) |
| browse | collections reached through Shares in `listVisibleCollections`, role-specific `permissions` | Permission matrix |
| browse | "Udostępnione mi" with role chips | Frontend: sidebar |
| browse | Viewer collections outside the default wishlist (`editable` scope) with real data | Permission matrix; Testing |
| browse | purchase details stripped from `BrowseItem` for Viewers; price options and totals disappear | Permission matrix; Testing |
| browse | `browse.purchaseDetailsHidden` refusal tested with a real Viewer (browse ticket 08) | Testing seam 1 |
| browse | "Wartość zakupów" exclusion note with real data | Testing seams 1 and 4 |
| browse | owner's name in the single-collection header of a shared collection | Frontend: browse header |
| browse | the "Osoby" link and dialog for Viewers | Frontend: browse header; people dialog |
| browse | "Zaproś osoby" in the empty collection state (Owner) | Frontend: browse header |
| browse | "Mam to" on wishlist cards only where `permissions.editItems` (now false for Viewer collections) | Testing seam 4 |

Nothing in those specs is re-specified: `assertCan`, `listCollectionsWhere`, `canSeePurchaseDetails`, `listVisibleCollections`, `resolveCollectionScope`, `browseItems`, `summariseItems` and the Catalog operations keep their interfaces. This spec changes **who gets which answer** and adds the access-management operations.

### Modules

- **Collections & Access** owns Shares and Invitations and the whole role matrix. It gains the operations below and a role resolution used by every existing access answer.
- **Identity** gains two read operations on its public interface (names indicative), used by Collections & Access, which already depends on it: `findUserByEmail(email)` → `{ id } | null` (non-tombstoned users only, exact match on the stored lowercased email) and `getProfiles(userIds)` → `{ id, name, email, avatarUrl }[]`. If `mvp-browse` already added a profile lookup for the owner's name, it is reused rather than duplicated.
- **Catalog** needs no new operations: every operation already starts with `assertCan` / `listCollectionsWhere` / `canSeePurchaseDetails`. Its item contract's `collection` object gains the actor's `role` and `permissions` (see Contracts).
- The **account-hooks** composition in the API app gains the real `isInvited` and `afterSignIn` and extends `summariseAccount` and `deleteAccountData`. Identity still does not import Collections & Access.

Dependency direction unchanged: Catalog → Collections & Access → Identity; no cycles.

### Data model

- **`collection_shares`**: `collection_id` (FK → `collections`, `ON DELETE CASCADE`), `user_id` (FK → `users`), `role` (`contributor` | `viewer`, text + `CHECK` from a shared Zod const), `invited_by_user_id` (FK → `users`), `created_at`, `updated_at`. Primary key `(collection_id, user_id)`; index on `user_id`.
- **`collection_invitations`**: `id` (UUIDv7), `collection_id` (FK `ON DELETE CASCADE`), `email` (trimmed, lowercased), `role` (same const), `invited_by_user_id`, `created_at`, `updated_at`. `UNIQUE (collection_id, email)`; index on `email`.
- The cascades from `collections` make the catalog's `hardDeleteOwnedCollections` remove the collections' Shares and Invitations with no code change in Catalog (ADR-0003 amendment).
- `users` rows are never hard-deleted (tombstones), so `user_id` and `invited_by_user_id` need no `SET NULL`; none of them appear in API responses except as the people list's user ids.
- Removing a Share (by the Owner or by leaving) and revoking an Invitation are **hard deletes** (ticket 09). Shares and Invitations of a soft-deleted collection stay in the database and are inert.

### Permission matrix (role resolution)

- The actor's role in a collection: `owner` when `owner_user_id` is the actor; else the role of their Share; else none. A soft-deleted collection gives none to everyone (ADR-0003).
- The existing closed action set, with this spec's additions, answered per role:

| Action | Owner | Contributor | Viewer |
|---|---|---|---|
| `collection:view` (browse items, item pages, shelves and tags lists with counts) | ✓ | ✓ | ✓ |
| `people:view` (people list: avatar, name, role) | ✓ | ✓ | ✓ |
| `item:edit` (add, edit, delete, "Mam to", photo link/replace/remove, move source and target) | ✓ | ✓ | ✗ |
| `organisation:manage` (create, rename, delete shelves and tags) | ✓ | ✓ | ✗ |
| `collection:manage` (rename, delete, invite, see Invitations and emails, change roles, remove people, revoke Invitations) | ✓ | ✗ | ✗ |
| `collection:leave` | ✗ | ✓ | ✓ |
| `canSeePurchaseDetails` | ✓ | ✓ | ✗ |

- `assertCan(actor, collectionId, action)`: no role → `NotFound`; a role without the action → `Forbidden` with code `access.insufficientRole` (params: `action`). This is how ticket 10's "no access → 404, weak role → 403" is enforced everywhere at once.
- `listCollectionsWhere(actor, action)` returns non-deleted collections where the actor's role grants the action. With `item:edit` this now includes Contributor collections, which widens, without changes elsewhere: the "Do kolekcji" select, the "Przenieś" targets (`moveItem` already requires `item:edit` in both collections), the duplicate scope, the `editable` wishlist scope, and the "Dodaj" fallback to "Nowa kolekcja" when the list is empty.
- `listVisibleCollections(actor)` adds collections reached through Shares, with `role` `contributor` / `viewer`, `owner: { id, name }` and `permissions { editItems, manageOrganisation, manageCollection, seePurchaseDetails }` from the matrix. Shared collections whose Owner is a tombstone cannot exist (account deletion hard-deletes them).
- Listing shelves and tags (with item counts) needs `collection:view`, so Viewers get shelf and tag filters and see them on items; mutations keep `organisation:manage`.
- Photo upload (`POST /images/photos`) stays authentication-only as in `mvp-catalog`; linking requires `item:edit`, so a Viewer's upload is just an orphan for the daily sweep.
- Metadata lookups stay authentication-only.

### Contracts and visibility

- Purchase details are absent (not null) from every response for collections where `canSeePurchaseDetails` is false: Catalog's item contract, `BrowseItem.purchase`, the summary's `purchaseTotal` (the collection is listed in `excludedCollections`). Priority, notes, genres, tags, shelf, photo, rating and consumed are returned to Viewers as to everyone.
- Catalog's item contract: `collection: { id, name, role, permissions }` (the same `role` / `permissions` shape as `listVisibleCollections`), so the item page decides its actions and role chip from the item response alone.
- People list contract (`listPeople`): `owner: { userId, name, avatarUrl, email? }`, `shares: [{ userId, name, avatarUrl, email?, role, isMe }]`, plus `isMe` on the owner. `email` is present **only when the actor is the Owner** (agreed with the user). Order: Owner first, then Shares by name with the Polish collation.
- Invitations contract (Owner only): `[{ id, email, role, createdAt }]`, oldest first.
- Invite result: `{ outcome: 'shared' | 'invited', email, role }`.
- `invited_by_user_id`, like every `*_by_user_id`, never appears in responses (ticket 21).
- New error codes in the shared vocabulary, each with a Polish translation: `access.insufficientRole` (403), `share.selfInvite` (Conflict), `share.alreadyShared` (Conflict: the email belongs to someone who already has a Share, or is the Owner's own address), `invitation.alreadyInvited` (Conflict), `share.ownerCannotLeave` (Conflict). An invalid email is a `ValidationFailed` from the Zod contract.

### Collections & Access operations (names indicative)

- `inviteToCollection(actor, collectionId, { email, role })` requires `collection:manage`. Normalises the email (trim, lowercase; no Gmail normalisation). Refuses the actor's own email (`share.selfInvite`), an email whose user already has a Share in the collection (`share.alreadyShared`) and an email with an Invitation there (`invitation.alreadyInvited`). Then `findUserByEmail`: a user → create a Share (`invited_by_user_id` = actor), outcome `shared`; no user → create an Invitation, outcome `invited`. Unique-constraint races map to the same Conflict codes.
- `listPeople(actor, collectionId)` requires `people:view`; profiles come from `getProfiles`.
- `listInvitations(actor, collectionId)` requires `collection:manage`.
- `changeShareRole(actor, collectionId, userId, role)`, `removeShare(actor, collectionId, userId)`, `changeInvitationRole(actor, invitationId, role)`, `revokeInvitation(actor, invitationId)` require `collection:manage` on the collection; an unknown Share or Invitation is `NotFound`. Changing to the current role is a no-op success.
- `leaveCollection(actor, collectionId)`: a non-Owner with a Share deletes it; the Owner gets `share.ownerCannotLeave`; no access is `NotFound`.
- Losing access (removal, leaving, account deletion) changes nothing in the collection (ticket 10). No notifications (ticket 21).
- `hasPendingInvitation(email)` → whether a non-deleted collection has an Invitation for that exact email (backs `isInvited`).
- `convertInvitations(user)` (backs `afterSignIn`): see below.
- For the operator: `summariseAccess(userId)` → per owned collection the Share and Invitation counts, plus the number of the user's Shares in other collections; `deleteSharesOf(userId, tx)` hard-deletes the user's Shares.

### Conversion of Invitations on sign-in

- `afterSignIn(user)` runs on every successful sign-in after Identity has refreshed the email (foundations). It calls `convertInvitations(user)`: in one transaction, every Invitation whose `email` equals the user's current email, in a non-deleted collection, becomes a Share with the Invitation's `role`, `invited_by_user_id` and `created_at`, and the Invitation is deleted.
- If the user already has a Share in that collection, the existing Share is kept unchanged and the Invitation is deleted. If the user is that collection's Owner, the Invitation is deleted without a Share.
- Invitations to soft-deleted collections are neither converted nor counted by `hasPendingInvitation`; they stay.
- A failure in conversion is logged and does not fail the sign-in: the Invitations remain and the next sign-in retries.
- The admission gate stays in Identity (foundations): at first sign-in, allowlist or `isInvited(email)`; a person admitted by an Invitation gets their Shares through `afterSignIn` in the same sign-in.
- An email that differs from every Invitation is refused with the existing `auth.inviteOnly` screen; nothing is guessed (ticket 09).

### Account hooks (API app composition)

- `isInvited(email)` → `hasPendingInvitation(email)`.
- `afterSignIn(user)` → `convertInvitations(user)`.
- `summariseAccount(userId)` → the catalog's owned-collection lines, each extended with "N people with access, M pending invitations", plus a line with the number of Shares in other collections.
- `deleteAccountData(userId, tx)` → `deleteSharesOf(userId, tx)` and the catalog's `hardDeleteOwnedCollections(userId, tx)` (whose cascade now also removes the owned collections' Shares and Invitations), in Identity's deletion transaction. Items and photos the user added to other collections stay, pointing at the tombstone (ticket 25). Invitations other Owners made for the user's email are left as they are; a later sign-in with that email goes through the gate as a new user (ticket 25).

### REST endpoints (under `/api`, all authenticated; names indicative)

- `GET /collections/{id}/people` → people list.
- `POST /collections/{id}/invitations` `{ email, role }` → invite result (creates a Share or an Invitation).
- `GET /collections/{id}/invitations` → pending Invitations (Owner).
- `PATCH /collections/{id}/shares/{userId}` `{ role }`; `DELETE /collections/{id}/shares/{userId}`.
- `PATCH /invitations/{id}` `{ role }`; `DELETE /invitations/{id}`.
- `POST /collections/{id}/leave`.
- Existing endpoints keep their shapes; their answers change per the matrix (`GET /collections` returns shared collections, item and browse responses drop purchase details for Viewers, mutating endpoints return 403 `access.insufficientRole` for a weak role).

### Frontend

**Sidebar.** "Moje kolekcje" keeps `role = owner`. "Udostępnione mi" lists the other visible collections, Polish-collated, each with a role chip ("Współtwórca" / "Obserwator") and the owner's name as the entry's tooltip and accessible description; the heading is hidden when there are none. The sidebar's collection list reloads when the app reloads collections (after create, delete, leave, and on navigation to a browse route), so a new Share appears without signing in again.

**Browse header** (single collection selected, from `mvp-browse`): now shows "Właściciel: <name>" for collections the actor doesn't own; the role chip; the settings link when `manageCollection` or `manageOrganisation`; otherwise an "Osoby" link that opens the people dialog. The empty-collection state's "Zaproś osoby" (Owner only) opens the invite dialog. Everything else that depends on role (price options, "Wartość zakupów" and its exclusion note, "Mam to" on wishlist cards, "Dodaj" context, wishlist default) already follows `permissions` and the `editable` scope.

**Item page** (from `mvp-catalog`): Edytuj, Przenieś, Usuń and "Mam to" only when `collection.permissions.editItems`; the mobile "⋮" menu hidden when it would be empty; the "Szczegóły zakupu" card only when the response carries purchase details; the role chip next to the collection in "Organizacja i klasyfikacja". The photo slot's "Zmień" / "Usuń" only in the edit form, which a Viewer can't reach.

**Collection settings** ("Ustawienia kolekcji", page title = collection name, subtitle "Ustawienia kolekcji", only the active tab's content shown):
- Owner: "Ogólne", "Półki i tagi" (both from `mvp-catalog`), **"Osoby"**, **"Zaproszenia"**.
- Contributor: "Półki i tagi" (full management) and **"Osoby"** (read-only).
- Viewer: no settings page; the settings route redirects to the collection's browse view.
- Tabs come from the collection's `permissions`; a tab route the actor may not use falls back to the first allowed tab.

**"Osoby" tab (Owner):** primary "Zaproś osobę" above the list; the Owner row ("Właściciel", avatar, name, email) has no controls; each Share row shows avatar, name, email, a role select (Współtwórca / Obserwator, saved on change, snackbar "Zmieniono rolę") and "Odbierz dostęp" with a confirmation dialog ("Odebrać dostęp osobie <name>?", "Anuluj" / "Odbierz dostęp"), snackbar "Odebrano dostęp".

**"Zaproszenia" tab (Owner):** rows with email, role select and "Cofnij zaproszenie" (no confirmation; snackbar "Cofnięto zaproszenie"); empty state "Brak oczekujących zaproszeń".

**Read-only people view** (Contributor's "Osoby" tab and the Viewer's "Osoby" dialog, one shared component): Owner row with "Właściciel", then Share rows with avatar (initials fallback), name and role, "(Ty)" on the current user, no emails, the note "Tylko właściciel zarządza dostępem.", and an "Opuść kolekcję" button (agreed with the user) with a confirmation ("Opuścić kolekcję „<nazwa>”? Stracisz do niej dostęp.", "Anuluj" / "Opuść"); afterwards the app navigates to "Wszystko", reloads the collections and shows the snackbar "Opuszczono kolekcję „<nazwa>”". The dialog has "Zamknij".

**Invite dialog "Zaproś osobę"** (UI brief 3.6):
- Step 1: "E-mail" field; role radio with the brief's two descriptions, Obserwator preselected; "Zaproś". Errors keyed by code: invalid email "Podaj poprawny adres e-mail", `share.selfInvite`, `share.alreadyShared` and `invitation.alreadyInvited` with messages pointing to changing the role instead.
- Step 2: "Dostęp nadany" (outcome `shared`) or "Zaproszenie zapisane" with "Dostęp pojawi się po pierwszym zalogowaniu tym adresem" (outcome `invited`); the read-only message; "Kopiuj wiadomość" (Clipboard API; turns into "Skopiowano"; when the clipboard is unavailable the message text is selected for manual copying); "Zamknij"; the note "Nie wysyłamy e-maili — prześlij wiadomość samodzielnie."
- The message is a translation with ICU parameters, built by a pure function from the collection name, the normalised email and an absolute link to the existing collection route (the app's own origin + route; no token, ticket 09): "Cześć! Udostępniam Ci moją kolekcję „{name}” w Shelvio. Zaloguj się przez Google adresem {email}: {link}". The present tense keeps it gender-neutral (the brief's "Udostępniłam" is feminine).
- Closing the dialog refreshes the "Osoby" and "Zaproszenia" lists. The message is not available again later (no resend, ticket 09); the link is just the collection URL.

**"Nie znaleziono" screen** (foundations): when a session exists, it also shows "Zalogowano jako <email>" and a "Zaloguj innym kontem" button that signs out and starts sign-in with `returnTo` = the current URL (Google's account chooser is already requested by foundations). The collection's name is never shown (ticket 09). With no session the screen is unchanged.

**Refusals:** a 403 `access.insufficientRole` shows the translated message from the shared error scope (foundations mechanism); the UI hides every action the matrix refuses, so this appears only with stale screens.

**Copy and rules:** role names "Właściciel", "Współtwórca", "Obserwator" (UI brief rule 3); every count through ICU plurals; no "added by" or activity anywhere; no undo; no emails sent. Text lives in a lazy Transloco scope owned by the sharing feature library, with shared keys for role names.

### E2E seed

- `contributor` gets a Contributor Share and `viewer` a Viewer Share to the seed collection "Dom" (owned by `owner`); `invited` gets a Viewer Invitation to "Dom" (no user; exercises the gate and conversion on first sign-in). `outsider` still has nothing.
- Exactly one e2e test signs in as `invited` (the conversion is irreversible within a run). Tests that change roles, Shares or Invitations create their own collection as `owner` and share it through the UI or API (foundations rule); seeded Shares are only read.

## Testing Decisions

### What makes a good test

- Tests exercise external behaviour through the highest available seam and never assert on internals (Drizzle queries, which helper ran, store internals). A refactor that keeps behaviour keeps tests green.
- Real Postgres (Testcontainers) for everything that persists; fakes only for what lies outside the process and isn't ours (Google via the fake OIDC provider, metadata sources, file storage) and for time. **No fakes of our own modules**: role behaviour is tested with real Shares created through `inviteToCollection`.
- Each test arranges its own data through operations and asserts only on what a caller observes: returned values and shapes (including absent fields), typed errors with their codes, data visible through other operations.

### Seams (agreed with the user)

1. **Domain operations** (primary seam): Collections & Access, Catalog and browse operations, and Identity's sign-in with the real account-hooks composition, Vitest against real Postgres, with the fake OIDC provider and fake clock from foundations. Covers:
   - invite: email trimmed and lowercased, Gmail dots and `+alias` distinct, existing user → Share (`shared`), unknown email → Invitation (`invited`), `share.selfInvite`, `share.alreadyShared`, `invitation.alreadyInvited`, non-Owner → `Forbidden` (Contributor, Viewer) or `NotFound` (no access);
   - people list: Owner first, Polish order, `isMe`, emails only for the Owner; Invitations listed only for the Owner;
   - role change, removal, revoke, leave (`share.ownerCannotLeave`), each refused for non-Owners with the right code; after removal or leaving the collection is `NotFound` for that user and its items, shelves, tags and photos are unchanged;
   - the matrix through real operations: a Contributor creates, edits, deletes, marks owned, links and removes photos, manages shelves and tags, moves between two collections where they are Owner/Contributor and is refused (`Forbidden`) moving into a Viewer collection; a Viewer is refused every mutation with `access.insufficientRole`; an outsider gets `NotFound` everywhere;
   - visibility: purchase details absent (not null) for Viewers in `getItem`, `browseItems` and `summariseItems`, present for Contributors; the item response's `collection.role` and `permissions`;
   - widening via `listCollectionsWhere`: Contributor collections as add and move targets and in the duplicate scope, Viewer collections excluded; `listVisibleCollections` with roles, owner names and permissions; the `editable` wishlist scope excluding Viewer collections; explicit Viewer collection IDs accepted in scope;
   - browse refusal with a real Viewer: price sort or purchase filters over a scope containing a Viewer collection → `browse.purchaseDetailsHidden`; allowed over own + Contributor collections; `purchaseTotal` with the Viewer collection in `excludedCollections` and absent when only Viewer collections are in scope;
   - soft-deleted collections: Shares hidden, Invitations neither admit nor convert;
   - sign-in (through `beginSignIn` → `completeSignIn`): an Invitation admits a new email at the gate and is converted into a Share with role, `invited_by` and `created_at` carried over; several Invitations convert at once; an existing user whose email changed gets matching Invitations converted; an Invitation where a Share exists or for the Owner's own collection is dropped without a duplicate; an Invitation for a different email still refuses with `auth.inviteOnly`; a conversion failure doesn't fail the sign-in and is retried next time;
   - account deletion (extending the foundations and catalog `deleteAccount` tests): the user's Shares in other collections gone, owned collections' Shares and Invitations gone with them, items the user added elsewhere kept, summary lines with people and Invitation counts, a later Invitation admitting the same Google account as a new user.
2. **HTTP adapter** (thin, in-process Nest over real Postgres, foundations prior art): no access → 404 and weak role → 403 `access.insufficientRole` rendered as `problem+json` on a representative mutating endpoint per module; the new Conflict codes; the people response without emails for non-Owners; the invitation endpoints' validation (invalid email, unknown role).
3. **Frontend unit tests** (Vitest, pure code): the invitation message builder (name, normalised email, absolute link, gender-neutral text), settings tabs from permissions (Owner four, Contributor two, Viewer none → redirect), item-page action visibility from permissions, sidebar split into "Moje kolekcje" / "Udostępnione mi". No component snapshot tests.
4. **E2E (Playwright, `e2e-fullstack`)**, desktop and mobile emulation where layout differs:
   - `invited` opens the "Dom" link signed out, signs in, lands in "Dom" as Obserwator, sees it under "Udostępnione mi";
   - `owner` creates a collection, invites the `viewer` account's email ("Dostęp nadany", copy the message) and an unknown email ("Zaproszenie zapisane", listed in "Zaproszenia"), changes the Invitation's role and revokes it; `viewer` sees the collection with the Obserwator chip; `owner` changes the Share to Współtwórca and `viewer` now sees edit actions; `owner` removes the Share and `viewer` gets "Nie znaleziono" with "Zalogowano jako …";
   - `viewer` on "Dom": item page without actions or purchase card, no price sort or filter, no "Wartość zakupów", "Osoby" dialog with "(Ty)", no emails and the note; "Dodaj" opens "Nowa kolekcja";
   - `contributor` on "Dom": adds an item to "Dom", edits it, uses "Mam to", manages shelves in a settings page with exactly "Półki i tagi" and a read-only "Osoby";
   - mixed scope: `owner` shares a collection with priced items as Viewer to `contributor`, who also owns a collection with a priced item; "Wszystko" shows "Wartość zakupów" with the note naming the excluded collection, the price sort is absent until the Viewer collection is deselected, and the wishlist leaves the Viewer collection out by default and hides "Mam to" on its cards when added;
   - leaving: `viewer` leaves a test-created collection from the "Osoby" dialog and lands on "Wszystko" without it;
   - `outsider` is still refused at the gate.

### Prior art

- Foundations: Identity domain tests with the fake OIDC provider and fake clock, the account-hooks test implementation, thin HTTP adapter tests, `actors.login`, seed organised per spec.
- Catalog: Collections & Access and Catalog domain tests (data arranged through operations), the `deleteAccount` extension tests, e2e on the seeded "Dom".
- Browse: `browseItems` / `summariseItems` / `listVisibleCollections` domain tests and the browse e2e suite, whose deferred Viewer cases this spec adds.

## Out of Scope

- Sending emails of any kind, an email provider, invitation tokens or expiring links (ticket 09).
- Accept or decline steps, a "declined" state, resending or re-copying an invitation message later (ticket 09).
- Gmail address normalisation or guessing a person behind a different email (ticket 09).
- Transferring collection ownership; more than one Owner (map Out of scope).
- A per-collection toggle for showing purchase details to Viewers (ticket 10).
- Notifications about gaining or losing access, an activity feed, showing who added or changed items (ticket 21).
- Self-service account deletion (ticket 25).
- Revoking image URLs a former member saw before (accepted by ADR-0005).
- Token-based API access and the MCP server.
- Production deployment (map Out of scope).

## Further Notes

- **Decisions made while writing this spec** (not stated in the map tickets; please confirm):
  - Emails in the people list are shown only to the Owner; Contributors and Viewers see avatar, name and role (ticket 10; mockup 16 shows emails, agreed with the user to follow the ticket).
  - "Opuść kolekcję" sits under the read-only people list (the Viewer's dialog and the Contributor's "Osoby" tab), with a confirmation, then lands on "Wszystko" (agreed with the user).
  - Obserwator is preselected in the invite dialog.
  - The invitation message uses the present tense ("Udostępniam Ci…") so it is gender-neutral; the link is the existing collection route, which `mvp-catalog` and `mvp-browse` kept for this purpose (ticket 09 writes `/collections/<id>`, the brief `/c/…`; whichever the route is, no token).
  - The "Nie znaleziono" screen shows the signed-in email and "Zaloguj innym kontem" instead of a separate "no access to this collection" screen, so ticket 09's "show the signed-in email, never the name" is met without revealing whether the collection exists.
  - Conversion failures are logged and retried on the next sign-in rather than failing the sign-in; an Invitation colliding with an existing Share or with the Owner's own collection is dropped.
  - A Viewer opening the settings route is redirected to the collection; Contributors' and Owners' tabs come from `permissions`.
  - "Udostępnione mi" shows the name and role chip only (UI brief); the owner's name ticket 09 asks for appears in the collection header and as the entry's tooltip.
  - New actions `people:view` and `collection:leave`; Owner-only access management reuses `collection:manage`.
  - Item responses carry the actor's `role` and `permissions` for their collection.
  - New copy not in the brief (please confirm wording): "Zalogowano jako …", "Zaloguj innym kontem", "Opuść kolekcję" and its confirmation, "Odebrać dostęp osobie …?", snackbars "Zmieniono rolę", "Odebrano dostęp", "Cofnięto zaproszenie", "Opuszczono kolekcję „…”", the invite-dialog error messages.
- Mockup deviations ignored per the UI README: "Kolekcja Katarzyny Nowak" pill and "5.0" next to stars (07), the "KROK 2 Z 2" eyebrow, the longer no-email note and the red dot on "Zaproszenia" (15), the "DOSTĘP I UPRAWNIENIA" eyebrow, emails for non-Owners and the longer note (16).
- No new glossary terms: Share, Invitation, Owner, Contributor, Viewer and Purchase details are already defined. "Role resolution", "people list" and "account hooks" are technical terms. No ADR conflicts; nothing here is hard to reverse.

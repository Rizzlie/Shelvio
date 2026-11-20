# 02: Viewer is read-only and never sees purchase details

**What to build:** A Viewer browses a shared collection with no actions anywhere and no purchase details. Item pages have no Edytuj / Przenieś / Usuń / "Mam to" and no "Szczegóły zakupu" card. Cards and list rows carry no prices. Price sorts and filters disappear whenever a Viewer collection is selected. "Wartość zakupów" covers only collections where purchase details are visible, with the exclusion note. The server never sends purchase details for Viewer collections. See the spec's "Contracts and visibility", "Permission matrix", "Frontend" (item page, collection settings) and Testing seams 1 and 4.

**Blocked by:** 01 (Shares and the role matrix).

**Status:** ready-for-agent

- [ ] Purchase details absent (not null) for Viewer collections in Catalog's item contract, `BrowseItem.purchase` and `summariseItems` (`purchaseTotal` lists the collection in `excludedCollections` and is absent when only Viewer collections are in scope).
- [ ] Catalog's item contract `collection` gains the actor's `role` and `permissions`; priority, notes, genres, tags, shelf, photo, rating and consumed are returned to Viewers as to everyone.
- [ ] Item page: actions only when `collection.permissions.editItems`; the mobile "⋮" menu hidden when it would be empty; the purchase card only when the response carries purchase details; the role chip next to the collection.
- [ ] The settings route of a Viewer collection redirects to the collection's browse view.
- [ ] Viewer collections are never offered in "Do kolekcji" or "Przenieś"; a Viewer with no editable collection gets "Nowa kolekcja" from "Dodaj" (existing behaviour, now verified with a real Viewer).
- [ ] Domain tests with a real Viewer Share: every mutation refused with `access.insufficientRole`; purchase details absent in `getItem`, `browseItems` and `summariseItems`; price sort or purchase filter over a scope containing a Viewer collection → `browse.purchaseDetailsHidden` (the refusal path deferred by browse ticket 08); the `editable` scope excluding Viewer collections while explicit Viewer IDs are accepted; the duplicate scope excluding Viewer collections.
- [ ] Frontend unit test: item-page action visibility from permissions.
- [ ] E2E: `viewer` on "Dom" sees an item page without actions or purchase card, no price sort or filter and no "Wartość zakupów"; "Dodaj" opens "Nowa kolekcja".
- [ ] E2E, mixed scope: `owner` shares a collection with priced items as Viewer with `contributor`, who owns a collection with a priced item; "Wszystko" shows "Wartość zakupów" with the note naming the excluded collection, the price sort is absent until that collection is deselected, and the wishlist leaves it out by default and shows no "Mam to" on its cards when it is added.

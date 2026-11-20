# 10: Wishlist

**What to build:** "Lista życzeń" in the sidebar shows the wanted items of the collections where the user may edit items, most wanted first; each wanted card the user may edit has a "Mam to" button that records the purchase and removes the item from the list. See the spec's "Visible collections and the wishlist default", "Frontend: routes and URL state" (Lista życzeń preset) and "Frontend: screen" ("Mam to" on wishlist cards, empty states).

**Blocked by:** 03 (Header counts and "Wartość zakupów"), 05 (URL state and the filter panel), 07 (Sorting).

**Status:** ready-for-agent

- [ ] `browseItems` and `summariseItems` accept `scope: editable` (`listCollectionsWhere(actor, 'item:edit')`); `GET /browse/items` and `/browse/summary` accept `scope=editable`; `collection` together with `scope` refused.
- [ ] "Lista życzeń" route and sidebar entry with active state; preset: scope `editable` when no `collection` in the URL, ownership status fixed to wanted (no status section in the panel, no status chip, status values in the URL dropped), sort priority desc; title "Lista życzeń"; other visible collections can be added through the picker.
- [ ] "Mam to" on wanted grid cards whose collection has `permissions.editItems`; opens Catalog's "Mam to!" dialog; on success the card is removed, the summary reloads and the snackbar "Przeniesiono do posiadanych" appears (no "Cofnij").
- [ ] Empty wishlist without filters: "Twoja lista życzeń jest pusta" with "Dodaj pozycję" (opens "Dodaj pozycję" with Chcę mieć preselected).
- [ ] Domain tests: `editable` scope equals the Owner's collections here; wanted-only results with priority order.
- [ ] Frontend unit tests: wishlist preset defaults omitted from the URL, status dropped on the wishlist.
- [ ] E2E: wishlist shows only wanted items in priority order; "Mam to" with a price removes the card and shows the snackbar; empty wishlist state in a fresh collection.

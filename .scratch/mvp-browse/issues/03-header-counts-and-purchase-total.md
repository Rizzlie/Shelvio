# 03: Header counts and "Wartość zakupów"

**What to build:** The header shows how many items the selected collections hold ("24 pozycje · 18 Mam · 6 Chcę mieć · 14 Przeczytane / przesłuchane") and, on the right, "Wartość zakupów": the sum in złoty of what the user paid for owned items in collections where they may see purchase details. See the spec's "Summary contract", "REST endpoints" (`GET /browse/summary`) and "Frontend: screen" (header).

**Blocked by:** 01 (Browse tracer).

**Status:** ready-for-agent

- [ ] Catalog: `summariseItems(actor, scope)` → `itemCount`, `ownedCount`, `wantedCount`, `consumedCount` over the collections in scope, ignoring text and other filters; deleted items and collections excluded.
- [ ] `purchaseTotal` sums `purchase_price_minor` of owned items in collections where `canSeePurchaseDetails` holds; kept values on wanted items excluded; absent when no included item has a price; carries `includedCollectionCount` and `excludedCollections`.
- [ ] `GET /browse/summary` with `collection` (repeatable) or `scope=editable`.
- [ ] Counts line with ICU plurals; zero parts other than the total hidden.
- [ ] "Wartość zakupów" formatted with the `pl-PL` money formatter ("1420,00 zł"); a small note naming excluded collections when there are any (never in this spec, rendered from the contract); compact form on mobile above the toolbar.
- [ ] The summary reloads when the collection selection changes, not when filters or search change.
- [ ] Domain tests: counts per status and consumed, filters ignored, total over owned items only, kept values on wanted items excluded, total absent without prices.
- [ ] Frontend unit test: which counts-line parts are shown.
- [ ] E2E: Wszystko shows the seeded counts and the purchase total; one collection shows its own.

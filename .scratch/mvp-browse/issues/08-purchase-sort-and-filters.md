# 08: Purchase-detail sorting and filters

**What to build:** When the user may see purchase details in every selected collection, they can sort by purchase price or date and filter by a price range in złoty and a date range; otherwise those options are absent, and links carrying them still open without them. See the spec's "Browse query" (purchase-detail rule), "Sorting and paging", "Visible collections and the wishlist default" and "Frontend: screen" (filter panel).

**Blocked by:** 05 (URL state and the filter panel), 07 (Sorting).

**Status:** ready-for-agent

- [ ] `browseItems` sort fields `purchasePrice` and `purchaseDate` and filters `purchasePrice { minMinor, maxMinor }`, `purchaseDate { from, to }` (inclusive); only owned items considered (wanted items' kept values empty, sorted last).
- [ ] Allowed only when `canSeePurchaseDetails` holds for every collection in scope, else `Forbidden` `browse.purchaseDetailsHidden` (Polish translation added).
- [ ] `GET /browse/items` parameters `priceMin`, `priceMax` (minor units), `boughtFrom`, `boughtTo` (`yyyy-MM-dd`), and the new `sort` values.
- [ ] Availability from each selected collection's `permissions.seePurchaseDetails` via a pure function; panel sections "Cena zakupu" (from/to in zł with the foundations amount parser) and "Data zakupu" (from/to with the foundations date format and datepicker) and the sort options shown only when available; chips for set ranges.
- [ ] Normalisation drops purchase filters and sorts when not available, falling back to the preset's default sort.
- [ ] Domain tests: both sorts both directions, ranges inclusive, wanted items with kept values never matching and sorted last, allowed for the Owner. (The refusal path with a real Viewer is tested in `mvp-sharing`.)
- [ ] Frontend unit tests: availability across selections, drop and fallback rules.
- [ ] E2E: filter by price range and sort by purchase date on Wszystko.

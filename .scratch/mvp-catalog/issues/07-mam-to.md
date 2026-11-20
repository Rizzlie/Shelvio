# 07: "Mam to"

**What to build:** On the page of a wanted item the Owner presses "Mam to", optionally enters the price and purchase date in the "Mam to!" dialog, and the item becomes owned. See the spec's "Catalog: items" (`markOwned`) and UI brief 3.2.

**Blocked by:** 03 (Edit and delete an item).

**Status:** ready-for-agent

- [ ] `markOwned(actor, itemId, { purchasePrice?, purchaseDate? })` → `POST /items/{id}/mark-owned`; only for wanted items (`item.notWanted`); writes the given values; keeps the stored priority; bumps `updated_*`.
- [ ] "Mam to" button on the item page for wanted items (in the "⋮" menu on mobile).
- [ ] Dialog "Mam to!" with the thumbnail (placeholder until ticket 09 provides the shared picture component), title, collection, optional "Cena zakupu" (zł), optional "Data zakupu" defaulting to today, "Anuluj" / "Zapisz".
- [ ] After saving: the page shows Mam and the purchase details; snackbar "Przeniesiono do posiadanych".
- [ ] Domain tests: wanted → owned with and without values, `item.notWanted` on an owned item, priority kept.
- [ ] E2E: mark a wanted item owned with a price and see it on the page.

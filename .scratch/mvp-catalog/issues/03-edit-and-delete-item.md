# 03: Edit and delete an item

**What to build:** From the item page the Owner opens "Edytuj pozycję", changes fields and saves, or deletes the item after confirming; leaving the form with unsaved changes asks first. See the spec's "Catalog: items" (`updateItem`, `deleteItem`) and "Frontend" (item form, dialogs).

**Blocked by:** 02 (Add an item by hand).

**Status:** ready-for-agent

- [ ] `updateItem` replaces all editable fields (`PUT /items/{id}`); item type and collection cannot change; bumps `updated_at` and `updated_by_user_id`; refreshes `search_text`.
- [ ] `deleteItem` soft-deletes (`deleted_at`, `deleted_by_user_id`); a deleted item is `NotFound` everywhere and disappears from the collection list.
- [ ] Item page actions Edytuj and Usuń (in the "⋮" menu on mobile).
- [ ] "Edytuj pozycję" prefilled, Typ read-only; kept purchase values reappear when switching back to Mam; "Niezapisane zmiany" in the save bar.
- [ ] Route guard dialog "Odrzucić zmiany?" with "Zostań" / "Odrzuć", also used by the add form.
- [ ] Dialog "Usunąć „<tytuł>”? Tej operacji nie można cofnąć." with "Anuluj" / "Usuń"; afterwards the user returns to the collection page.
- [ ] Domain tests: update replaces fields, type and collection fixed, `updated_by` bump, soft delete hides the item from every operation, non-owner → `NotFound`.
- [ ] E2E: edit a field and see it on the page; the discard dialog; delete returns to the collection without the item.

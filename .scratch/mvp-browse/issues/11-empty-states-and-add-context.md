# 11: Empty states and the "Dodaj" context

**What to build:** Every empty browse situation tells the user what to do next, and pressing "Dodaj" (top bar, FAB or an empty-state button) opens "Dodaj pozycję" preset from what the user was looking at: the collection, the shelf, the item type and Chcę mieć on the wishlist. See the spec's "Frontend: screen" (empty states, "Dodaj" context).

**Blocked by:** 06 (Shelf and tag filters), 10 (Wishlist).

**Status:** ready-for-agent

- [ ] Empty states: no visible collection → "Nie masz jeszcze żadnej kolekcji" with "Nowa kolekcja" (catalog dialog); one collection with no items and no filters → "Ta kolekcja jest pusta" with "Dodaj pierwszą pozycję" (only with `editItems`); several collections with no items and no filters → "Brak pozycji" with "Dodaj pozycję"; any other zero result → "Brak wyników" with "Wyczyść filtry"; the wishlist state from ticket 10 kept.
- [ ] "Dodaj" context passed through the catalog's add-page query parameters: the collection when exactly one editable collection is selected, the shelf when exactly one shelf value is set, the item type when exactly one type is set, Chcę mieć on the wishlist or when the status filter is exactly Chcę mieć.
- [ ] Frontend unit tests: empty-state choice from state and counts; "Dodaj" context from state.
- [ ] E2E: a fresh account without collections sees "Nie masz jeszcze żadnej kolekcji" and creates one; an empty collection shows "Ta kolekcja jest pusta"; FAB on mobile with a single collection and a shelf filter opens the add page with both preselected.

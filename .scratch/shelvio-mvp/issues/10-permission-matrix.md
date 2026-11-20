# Permission matrix

Type: grilling
Status: resolved
Blocked by: none
Map: [Shelvio MVP](../map.md)

## Question

Exactly what can an owner, a contributor and a viewer do in a collection?

Agreed: one owner per collection; only the owner invites, changes roles, removes people and deletes the collection; a person with access can leave on their own; contributors add, edit and remove items; viewers only browse.

Settle the open cells:
- managing shelves and tags (create, rename, delete): owner only, or contributors too?
- uploading and removing user photos,
- moving an item to another collection (requires rights in both collections?),
- whether viewers see purchase price and notes,
- whether contributors see who else has access,
- (Enforcement location is settled by Technical foundations: inside domain operations; the UI only hides what the backend would refuse.)

## Answer

| Action | Owner | Contributor | Viewer |
|---|---|---|---|
| Browse items, incl. wanted items (wishlist) with priority, notes, genres, tags, shelves, photos | ✓ | ✓ | ✓ |
| See **purchase details** (price, date) and price-based totals (collection value, spend per currency) | ✓ | ✓ | ✗ |
| Non-monetary stats (counts, genres, consumed) | ✓ | ✓ | ✓ |
| Add, edit, remove items (any item, not only own) | ✓ | ✓ | ✗ |
| Upload, replace, remove the user photo on any item | ✓ | ✓ | ✗ |
| Create, rename, delete shelves and tags | ✓ | ✓ | ✗ |
| Move an item to another collection | owner or contributor in **both** collections | | ✗ |
| See the people list (owner + Shares: avatar, name, role), read-only | ✓ (and manages it) | ✓ | ✓ |
| See pending Invitations (emails) | ✓ | ✗ | ✗ |
| Invite, change roles, remove people, revoke Invitations | ✓ | ✗ | ✗ |
| Rename the collection, edit description and settings, delete it | ✓ | ✗ | ✗ |
| Leave the collection | n/a | ✓ | ✓ |

**Purchase details for viewers** are stripped by the domain operation and absent from the viewer's contract shape, not merely hidden in the UI (matters for the future MCP server). No per-collection toggle in the MVP.

**Moving an item** clears its shelf. Tags are matched by name, case-insensitively, against the target collection's tags; missing ones are created there. Genres, credits, photo, rating, consumed, ownership status, priority, purchase details and notes move unchanged.

**Losing access** (leaving or being removed) changes nothing in the collection: items, shelves, tags and photos a contributor added stay, since they belong to the collection.

**Refusals**: no access to the collection (or its items) → `404`, never revealing that it exists (consistent with Invitation flow). Access but too weak a role → `403` with an error code. The UI hides actions the backend would refuse.

Glossary: Contributor and Viewer definitions sharpened; added **Purchase details**. No ADR: a matrix is easy to change.

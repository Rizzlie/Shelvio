# Class-table inheritance for item types

Every item is a row in a common `items` table (fields shared by all item types: type, title, ownership status, priority, rating, consumed, purchase date and price, notes, shelf), plus exactly one row in a per-type details table (`book_details`, `vinyl_details`) that shares its primary key. Every per-type field is a typed column with its own constraints. A composite foreign key `(item_id, item_type)` against `UNIQUE (id, item_type)` on `items`, plus a `CHECK` on the details table's `item_type`, lets the database guarantee that a details row matches its item's type. The domain operation creating the item guarantees, in the same transaction, that the details row exists. Adding an item type (e.g. CD) means one new details table, one Zod schema branch and one migration.

Even fields that two types happen to share, such as `year`, stay in the per-type tables: what they mean differs by type (book edition vs vinyl pressing), and keeping `items` limited to truly type-independent fields keeps the rule simple.

## Considered options

- **Typed JSONB `attributes` column validated per type by Zod**: rejected. Adding a type needs no migration, but the database guarantees nothing, and filtering, indexing and full-text search on per-type fields (ISBN, year, format) are awkward. The future MCP server needs consistent, typed data.
- **Single-table inheritance with nullable columns**: rejected. It grows less readable with every type, and per-type constraints become conditional `CHECK`s.
- **EAV**: rejected. It loses types and makes every query painful.

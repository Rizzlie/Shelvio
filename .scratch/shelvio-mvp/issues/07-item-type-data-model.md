# Data model for item types

Type: grilling
Status: resolved
Blocked by: 05, 15
Map: [Shelvio MVP](../map.md)

## Question

How are item types represented in Postgres so that adding a new item type (e.g. CD) later is cheap, queries across all items of a collection stay simple, and the later MCP server gets consistent, typed data?

Options to weigh: a common item table plus one table per type (class-table inheritance), a single table with a typed JSONB attributes column validated per type, single-table inheritance with nullable columns, or EAV. The ORM is Drizzle and all tables live in `libs/api/db` (see Technical foundations). Likely an ADR.

Input from Item fields per item type: the model must also hold global **Creators** and item→creator **credits** (role, position), per-type enums (binding, size, speed, release kind), and money as minor units + currency.

## Answer

Recorded as [ADR-0002](../../../docs/adr/0002-class-table-inheritance-for-item-types.md) (item types) and [ADR-0003](../../../docs/adr/0003-soft-delete-for-items-and-collections.md) (soft delete). Glossary term added: **Credit**.

**Item types (class-table inheritance).** `items` holds the type-independent fields: `id`, `collection_id`, `item_type`, `title`, `ownership_status`, `priority`, `rating`, `consumed`, `purchase_date`, `purchase_price_minor`, `purchase_currency`, `notes`, `shelf_id`. `book_details` and `vinyl_details` are 1:1 with `items` (`item_id` is PK and FK) and hold every per-type field from Item fields per item type as typed columns. `year` stays per type and is not hoisted to `items`.
- Type integrity: `UNIQUE (id, item_type)` on `items`; each details table has `item_type` fixed by `CHECK` and a composite FK `(item_id, item_type)`. The domain operation guarantees, in one transaction, that the details row exists. A details row may have all fields NULL.

**Enumerations** (`item_type`, `ownership_status`, `priority`, `binding`, `size`, `speed`, `release_kind`, credit `role`): `text` + `CHECK`, generated from the same const arrays the Zod schemas in `libs/shared/contracts` use. No `pgEnum`, no lookup tables (genres excepted, see Genre lists and mapping). `speed` values are `'33'`, `'45'`, `'78'`.

**Creators and credits** (Catalog module).
- `creators`: `id`, `name`, `sort_name` (nullable), `search_name` (generated: lower + unaccent of `name`, trigram index for autocomplete), `openlibrary_author_key`, `discogs_artist_id`, `musicbrainz_artist_id`, each with a partial `UNIQUE` where not NULL.
- `item_credits`: `item_id`, `creator_id`, `role`, `position`; PK `(item_id, creator_id)` (one role per creator per item), `UNIQUE (item_id, role, position)`; cascades with the item. Valid roles per item type are checked by the domain, not the database. Creators without items stay.

**External IDs**: typed columns on the details tables (`isbn13 char(13)` with a digits `CHECK`, `openlibrary_edition_id`, `openlibrary_work_id`, `google_books_volume_id`; `barcode`, `discogs_release_id`, `discogs_master_id`, `musicbrainz_release_id`, `musicbrainz_release_group_id`), indexed, never `UNIQUE`. No generic external-ID table.

**Identity and row metadata**: UUIDv7 primary keys everywhere. `created_at` and `updated_at` on every main table; `created_by_user_id` on `items`.

**Soft delete** (`deleted_at`, `deleted_by_user_id`) on `items` and `collections` only. Soft-deleted rows are invisible to every operation; normal-read indexes are partial. Deleting a collection marks only the collection; its items are hidden through it. Shelves and tags are hard-deleted (`shelf_id` → NULL, `item_tags` cascade). No trash, restore or purge in the MVP; the orphaned-file sweep must keep files of soft-deleted rows.

**Money and status-dependent fields**: `CHECK` that price and currency are both set or both NULL, price `>= 0`. No `CHECK`s tied to `ownership_status`; values are kept on status change and hidden by the domain and the contract.

**Contract shape** (Zod, REST, MCP): common fields plus a nested per-type object, e.g. `{ itemType: 'book', title, …, book: { isbn13, … }, credits: [{ creator: { id, name }, role, position }] }`, as a discriminated union on `itemType`.

**Organisation links** (shape only): `items.shelf_id` nullable FK `ON DELETE SET NULL`; `item_tags (item_id, tag_id)`; `item_genres (item_id, genre_id)` to the `genres` table defined by Genre lists and mapping. Cover and user photo references are for Covers, photos and thumbnails.

## Comments

**2026-11-20, addendum from [Item activity](21-item-activity.md).** `items` also gets `updated_by_user_id`, set by the domain operation that bumps `updated_at`. None of the `*_by_user_id` columns appear in REST API responses.

**2026-11-20, input from [Add-item flow](13-add-item-flow.md).** Google Books is dropped from the MVP, so `google_books_volume_id` on book details is no longer filled: replace it with `bn_record_id` (Polish National Library record number, used for the "Źródła" link). e-ISBN has no public record page and needs no column.

**2026-11-20, amended by [Creator duplicates and corrections](26-creator-duplicates.md).** Creators without credits no longer stay: a daily job deletes creators with no credits (credits on soft-deleted items count) older than 24 h. The creator search column covers `name` and `sort_name`.

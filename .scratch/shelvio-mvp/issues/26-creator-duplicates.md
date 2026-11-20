# Creator duplicates and corrections

Type: grilling
Status: resolved
Blocked by: none
Map: [Shelvio MVP](../map.md)

## Question

How are duplicate or misspelled global **Creators** ("Tokarczuk, Olga" vs "Olga Tokarczuk") prevented, corrected or merged in the MVP, and who may do it?

Known so far:
- [Item fields per item type](05-item-fields-per-type.md): Creators are global and linked to items by credits with roles.
- [Add-item flow](13-add-item-flow.md): creators are matched by external ID, then by normalised name.
- Creators are not user-editable in the MVP.

Decide:
- whether name normalisation at save time (e.g. "Surname, Name" inversion) is enough for the MVP,
- whether anyone can rename or merge creators (an admin, via SQL only, or not at all), and what a user does when a creator's name is wrong on their item (re-link to another creator, create a new one),
- what a merge does to credits and external IDs.

## Answer

Resolved 2026-11-20 (grilling).

**Normalisation on save.** Every creator name is normalised to Unicode NFC, trimmed, and runs of whitespace collapsed to one space. "Surname, Name" inversion is applied **only** for sources known to invert names (the Polish National Library), never to manually typed text: names such as "Earth, Wind & Fire" or "Crosby, Stills & Nash" contain commas and must not be flipped. No fuzzy/typo matching in the MVP.

**Matching against both names.** Creator autocomplete and save-time name matching compare the input with both `name` and `sort_name` (case- and diacritic-insensitive), so typing "Tokarczuk, Olga" finds the existing "Olga Tokarczuk". The creator's search column therefore covers `name` and `sort_name`.

**Name match vs external IDs.** On save, matching stays: external ID first, then exact normalised name, with two rules:
- A name match is **rejected** when both the candidate and the existing creator have an ID from the same source and the IDs differ (e.g. two Discogs "John Williams" with different artist IDs); a new creator is created instead.
- When a name match hits a creator that has no ID for that source, the candidate's ID is **added** to the creator, so later saves match by ID.

**Who corrects creators.** Nobody in the UI. The operator has two CLI commands, in the same style as account deletion ([Account lifecycle](25-account-lifecycle.md)), calling Catalog domain operations, each printing a summary and asking for confirmation:
- `creator:rename <id>`: change `name` and/or `sort_name`; refreshes the search text of every item credited to the creator.
- `creator:merge <survivor> <merged>`: see below.

A user who spots a wrong creator reports it to the operator outside the app; on their own item they can immediately re-link to another creator or create a new one (unchanged from [Item fields per item type](05-item-fields-per-type.md)).

**What a merge does** (one transaction):
- All credits of the merged creator are repointed to the survivor. Where an item already credits both, the survivor's credit is kept, the merged creator's credit is dropped, and positions within that item's roles are renumbered without gaps.
- External IDs the survivor lacks are copied from the merged creator. If both have **different** IDs from the same source, the merge is refused (the source says they are different people).
- The merged creator is hard-deleted (creators have no soft delete).
- Search text is refreshed on every affected item, soft-deleted ones included. `updated_at` / `updated_by_user_id` are not touched (an operator action, not a user edit).

**Orphan creators.** A daily periodic job (same mechanism as the image sweep, [Deployment pipeline and environments](24-deployment-pipeline.md)) deletes creators that have no credits at all (credits on soft-deleted items count) and were created more than 24 h ago. This replaces "creators without items stay" from [Data model for item types](07-item-type-data-model.md), and keeps abandoned typos out of everyone's autocomplete.

No new glossary terms; no ADR (operator commands and the sweep are cheap to change).

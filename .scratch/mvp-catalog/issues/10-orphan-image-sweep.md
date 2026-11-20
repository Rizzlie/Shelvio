# 10: Orphan-image sweep

**What to build:** Photos that were uploaded but never linked, or were replaced or removed, are deleted from storage after a day, while files of soft-deleted items and collections stay. See the spec's "Media" (orphan-image job) and ADR-0003.

**Blocked by:** 09 (Item photos).

**Status:** ready-for-agent

- [ ] Daily job registered with the foundations job runner.
- [ ] Deletes images referenced by no item's cover or photo and older than 24 h, objects first, then rows; soft-deleted items and items of soft-deleted collections count as references.
- [ ] Deletes stored objects older than 24 h that have no `images` row.
- [ ] Idempotent re-run.
- [ ] Domain tests with a fake clock and in-memory storage: an unlinked photo kept before 24 h and removed after; a replaced photo removed; photos of a soft-deleted item and of an item in a soft-deleted collection kept; a stray object removed.

# 17: e-ISBN source

**What to build:** Polish ISBNs the Polish National Library doesn't know are found in e-ISBN, and e-ISBN supplies a cover for Polish books when the publisher uploaded one. See the spec's "Metadata Lookup" (adapters), ADR-0004 and `research/polish-book-coverage.md`.

**Blocked by:** 15 (Covers from lookups), 16 (Polish National Library source).

**Status:** ready-for-agent

- [ ] e-ISBN adapter: ISBN-13 lookup only (ISBN-10 converted first), ONIX 3.0 parsing of factual fields only: title, subtitle, contributors with role codes (A01 author, B06 translator) and sequence, `ImprintName` preferred over the legal publisher name, publishing year, page extent, language, ISBN; binding from `ProductForm` where it maps; `TextContent` (blurbs, bios, tables of contents) never copied; Thema subject codes as genre hints.
- [ ] `findCover` from the `SupportingResource` cover link; e-ISBN host on the cover allowlist; for Polish ISBNs the cover is taken from e-ISBN when present, else from Open Library (ticket 18).
- [ ] Genre mapping gains a prefix table for e-ISBN Thema codes.
- [ ] Included in `lookup:smoke`.
- [ ] Adapter tests on recorded fixtures: a hit with a cover, a hit without, an empty response (header without `<Product>`), `TextContent` ignored, publisher name choice.

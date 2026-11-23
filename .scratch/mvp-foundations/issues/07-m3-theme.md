# 07: Angular Material M3 theme and mode store

**What to build:** Shelvio looks like the UI brief's "Warm Editorial Archival" design in light and warm-charcoal dark mode, follows the system mode by default and applies a stored choice from the first paint, including on public screens. The switch control itself is placed in the sidebar by ticket 17. See the spec's "Theme" and the UI theme decisions.

**Blocked by:** 06 (Translations and the 404 screen).

**Status:** done

- [x] M3 palettes generated from the seed colors and applied with `mat.theme()`; dark mode from the same palettes via `color-scheme` / `light-dark()`.
- [x] Only surface/background `--mat-sys-*` tokens overridden by hand, with the exact light and dark values from the theme decisions; the dark primary is the generated dark-scheme primary.
- [x] Color roles: brass → `tertiary`, terracotta → `error`, custom `--shelvio-warning` token for amber soft warnings.
- [x] Fonts self-hosted via `@fontsource` with the latin-ext subset: Newsreader for display/headline roles, Plus Jakarta Sans for title/body/label; Material Symbols from Google Fonts. Polish diacritics render in both.
- [x] Theme-mode store: Jasny / Ciemny / Systemowy, default Systemowy, persisted in `localStorage`, falling back to Systemowy when storage is blocked; applied before first paint (no flash). Unit-tested.
- [x] A theme-switch `ui` component (inputs/outputs only) ready for the sidebar.
- [x] The 404 screen renders correctly in both modes; visible focus rings and accessible contrast.

# UI brief and theme

Type: prototype
Status: resolved
Blocked by: 05, 09, 10, 14, 16
Map: [Shelvio MVP](../map.md)

## Question

What does the MVP user interface contain and look like: every screen, its behaviour per role, the copy, the visual direction, the theme (light and dark) and the formatting of dates, money and counts?

Worked as a HITL prototype session (2026-11-18 to 2026-11-20): a prompt for Google Stitch was grilled out, mockups were generated and reviewed over several rounds, and the prompt was corrected each time the tool drifted.

## Answer

All assets live in [`ui/`](../ui/README.md); start with its README.

- **[ui-brief.md](../ui/ui-brief.md)** is the source of truth for the UI. It covers:
  - hard rules (show only what is listed, closed vocabulary, Polish formats, Viewer never sees purchase details, two statuses only, PLN only),
  - the app shell,
  - screens: browse (grid/list, filters, search), wishlist with "Mam to", item detail, add item (search / scan / manual), item form, collection settings and invitations, dialogs and states,
  - visual direction, mock data and out of scope.
- **[theme-decisions.md](../ui/theme-decisions.md)** covers:
  - Angular Material M3 palettes generated from seed colors, with dark mode from the same palettes,
  - exact light seeds and warm-charcoal dark surfaces, and color roles (brass = tertiary, terracotta = error, `--shelvio-warning`),
  - a Jasny / Ciemny / Systemowy switch in `localStorage`,
  - self-hosted Newsreader + Plus Jakarta Sans, with Material Symbols from Google Fonts,
  - formatting: dates `dd.MM.yyyy` defined in one place, date-fns adapter, `pl-PL` money "1420,00 zł", PLN only, stars without numbers, hyphenated ISBN, ICU plurals for every count.
- **[design-system.md](../ui/design-system.md)** and **`ui/screens/`** hold reference mockups. They show layout and style only; the README lists what each one gets wrong.

Decisions that changed or fed other tickets (recorded in their Comments):
- [Browse and search](16-browse-and-search.md): the wishlist defaults to Owner/Contributor collections.
- [Item fields per item type](05-item-fields-per-type.md): the MVP UI is PLN only; the currency column stays.
- [Covers, photos and thumbnails](11-covers-photos-thumbnails.md): the lookup cover is read-only, one user photo, display fallback.
- [Add-item flow](13-add-item-flow.md): entry points, candidates + preview, scan result, not-found, duplicate warning.
- Duplicate detection (former fog): a soft amber warning when the same ISBN or release exists in a visible collection; saving is still allowed.

No glossary changes. No ADR: everything here is easy to change.

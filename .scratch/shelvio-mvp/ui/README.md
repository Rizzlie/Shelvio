# Shelvio UI

Outcome of the UI planning session (2026-11-18 to 2026-11-20) for the [Shelvio MVP](../map.md) map: a brief, a design system and reference mockups generated with Google Stitch.

**Source of truth:** [ui-brief.md](ui-brief.md). The mockups show layout and visual style only; they still contain invented content (labels, captions, fields) that the brief forbids. Where a mockup and the brief disagree, the brief wins.

## Files

- [ui-brief.md](ui-brief.md): screens, behaviour, rules, copy, mock data and out-of-scope list.
- [design-system.md](design-system.md): "Warm Editorial Archival" light-theme tokens from Stitch (colors, Newsreader + Plus Jakarta Sans, radii, spacing). It has **no dark palette** and its YAML tokens contradict its prose; [theme-decisions.md](theme-decisions.md) settles which values count. Ignore its mentions of "owned/verified badges" and "collection status awards".
- [theme-decisions.md](theme-decisions.md): how the Angular Material theme is built (light seeds, dark surfaces, color roles, mode switch, fonts and icons) and the formatting rules (dates, money, PLN only, rating, ISBN, plurals).
- `screens/`: the best mockup of each screen.

## Screens and known deviations from the brief

| Screen | File | Use for | Ignore / wrong in the mockup |
|---|---|---|---|
| Browse, grid | `01-browse-grid-desktop.png` | shell, header with counts and purchase total, toolbar, filter overlay, card | broken Astigmatic cover; browser chrome inside some covers |
| Browse, grid, mobile | `02-browse-grid-mobile.png` | mobile layout, placeholder covers | – |
| Browse, dark | `03-browse-dark-desktop.png` | dark palette | "Zastosuj filtry" button (filters apply instantly); default-blue checkboxes |
| Browse, list | `04-browse-list-desktop.png` | list columns | old style; title "Księgozbiór i Fonoteka", breadcrumb, "Zsynchronizowano…" footer; table overflows (must fit at 1280 px) |
| Wishlist, "Mam to!" | `05-wishlist-have-it-dialog-desktop.png` | dialog | the "PLN" suffix should read "zł" (PLN only, no currency select) |
| Item detail, owner | `06-item-detail-owner-desktop.png` | detail layout | broken cover; text wrapping glitches |
| Item detail, viewer | `07-…-desktop.png`, `08-…-mobile.png` | viewer rules (no actions, no purchase) | "Kolekcja Katarzyny Nowak" pill; wrapping glitches |
| Add, search | `09-add-search-desktop.png` | candidates + preview with shelf and status | broken covers |
| Add, scan | `10-add-scan-desktop.png`, `11-add-scan-mobile.png` | scanner and "Rozpoznano" (mobile is the cleaner one) | desktop: "Katalog zintegrowany z Discogs & Biblioteką Narodową" (wrong sources), camera/auto-focus labels, English format text |
| Add, not found | `12-add-not-found-desktop.png` | not-found state | the Biblioteka Narodowa line |
| Item form | `13-item-form-book-desktop.png`, `14-item-form-vinyl-desktop.png` | 8 sections, sticky index, sticky save bar (book version is cleaner) | old style; vinyl: "Krok 01…", "Metryka nośnika", US dates, hierarchical shelf, "Notatki kuratorskie"; both: "Ostatnia synchronizacja" |
| Invite dialog | `15-invite-dialog-desktop.png` | step 2 with the copyable message | old style; settings tabs behind it are mixed up |
| People, viewer | `16-people-viewer-desktop.png` | read-only people dialog | old style; note must read "Tylko właściciel zarządza dostępem." |

Not mocked up (brief only): collection settings tabs and the Contributor variant, new collection / move / delete / discard-changes dialogs, sign-in, no-access, 404 and empty states.

## On the map

This session is recorded as [UI brief and theme](../issues/20-ui-brief-and-theme.md). Its effects on other tickets are in their Comments: [Browse and search](../issues/16-browse-and-search.md) (wishlist scope), [Item fields per item type](../issues/05-item-fields-per-type.md) (PLN only), [Covers, photos and thumbnails](../issues/11-covers-photos-thumbnails.md) and [Add-item flow](../issues/13-add-item-flow.md) (UI input). The duplicate-detection fog was resolved and removed from the map.

# Theme and formatting decisions

Decided on 2026-11-20 during the UI planning session. They complete [design-system.md](design-system.md) (which has no dark palette and contradicts itself) and [ui-brief.md](ui-brief.md). Translation tooling (Transloco, ICU plurals, `transloco-locale` for `pl-PL`) was already settled by [Translation approach](../issues/14-i18n-approach.md).

## Theme

1. **Approach.** Angular Material M3 with palettes generated from seed colors (`ng generate @angular/material:theme-color`) and applied with `mat.theme()`. Dark mode comes from the same palettes via `color-scheme` / `light-dark()`. Only the surface/background `--mat-sys-*` tokens are overridden by hand, to get the exact paper and charcoal tones below.
2. **Light seeds.** The prose values in `design-system.md` are authoritative; its conflicting YAML tokens (primary `#012d18`, background `#fef8f3`, …) are discarded.

   | Role | Value |
   |---|---|
   | Primary (forest green) | `#1b432c` |
   | Background (paper) | `#fbf9f5` |
   | Cards / surface | `#ffffff` |
   | Tinted containers | `#f6f3eb` |
   | Hairline outline | `#e4e0d7` |
   | Text primary / secondary | `#2c2a27` / `#68645e` |
   | Brass | `#c47a2b` |
   | Terracotta | `#8c4a43` |

3. **Dark surfaces** (sampled from `screens/03-browse-dark-desktop.png`; warm charcoal, never neutral grey or pure black):

   | Role | Value |
   |---|---|
   | Page background | `#171513` |
   | Cards | `#1c1a17` |
   | Panels, sidebar | `#24211d` |
   | Higher containers | `#2d2a25` |
   | Text | `#faf5ef` |

   The dark-mode green is the generated M3 palette's dark-scheme primary (a light green around `#a5d1b1` with dark text on filled buttons), not the mid green `#4e8766` from the mockup, which fails contrast with white text.
4. **Color roles.**
   - Brass → `tertiary`: rating stars.
   - Terracotta → `error`: destructive actions and errors.
   - Amber → custom token `--shelvio-warning`: soft warnings such as the duplicate notice (M3 has no warning role).
   - Collections have no colors of their own; collection chips are neutral.
5. **Mode switch.** Three options, Jasny / Ciemny / Systemowy, default Systemowy. The choice is stored in `localStorage` (per browser; there is no user profile in the MVP). The switch lives in the sidebar (in the drawer on mobile). Pre-sign-in screens (sign-in, no access, 404) follow the stored or system mode.
6. **Fonts.**
   - Newsreader for the M3 display and headline roles; Plus Jakarta Sans for title, body and label.
   - Both are self-hosted via `@fontsource` with the **latin-ext** subset (Polish characters).
   - **Material Symbols icons are loaded from Google Fonts.**

## Formatting

7. **Dates.**
   - Always `dd.MM.yyyy` (`14.05.2022`), including "Dodano …"; no long form like "14 maja 2022".
   - The format is defined in **one place in code** (a single config/token) used by display, the datepicker and parsing, so changing it is a one-line change.
   - Datepicker: `@angular/material-date-fns-adapter` with the `pl` locale (the default native adapter cannot parse a typed `14.05.2022`).
   - A purchase date is date-only, sent to the API as `2022-05-14`, no time or timezone.
8. **Money.**
   - Displayed in the `pl-PL` standard: "1420,00 zł", "14 200,00 zł" (CLDR does not group four-digit numbers; accepted as is).
   - The amount input accepts a comma or a dot, at most 2 decimals; the value is stored in grosze (minor units).
9. **PLN only in the MVP.**
   - The currency column stays in the database and API (as decided in [Item fields per item type](../issues/05-item-fields-per-type.md)) and is always `PLN`.
   - The UI has no currency select; "Wartość zakupów" is a single amount.
   - Other currencies come after the MVP as a UI-only change, with no migration.
10. **Rating.** Stars only, no number next to them; the accessible label is "Ocena: 5 z 5".
11. **ISBN.** Stored as 13 digits; displayed hyphenated by publisher ranges (`978-83-08-04918-1`) using the `isbn3` library. Search accepts both forms.
12. **Plain numbers.** Year, page count, volume number and catalogue number are rendered as plain text, never through number formatting. Only money and counts are locale-formatted.
13. **Plurals.** Every number inside UI text goes through an ICU `plural` (`{count, plural, one {# pozycja} few {# pozycje} many {# pozycji} other {# pozycji}}`); constructions like "pozycja(e)" or suffixes glued on in code are not allowed. Numbers inside messages are formatted for `pl-PL`.

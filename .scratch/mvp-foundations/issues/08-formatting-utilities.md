# 08: Formatting utilities

**What to build:** Later features format and parse dates, money and ISBNs the Polish way from one shared place. See the spec's "Translation and formatting" and the formatting rules in the UI theme decisions.

**Blocked by:** 06 (Translations and the 404 screen).

**Status:** done

- [x] The date format `dd.MM.yyyy` is defined in exactly one place (a single config/token) used by display, the Material datepicker and parsing.
- [x] The datepicker uses `@angular/material-date-fns-adapter` with the `pl` locale; typing `14.05.2022` parses correctly; date-only values convert to and from `yyyy-MM-dd`.
- [x] Money: minor units → `pl-PL` string ("1420,00 zł", "14 200,00 zł").
- [x] Amount parsing accepts a comma or a dot and at most 2 decimals, returning minor units; invalid input is rejected.
- [x] ISBN-13 hyphenation by publisher ranges using `isbn3` (e.g. `978-83-08-04918-1`).
- [x] All of the above live in `util` libraries with Vitest unit tests covering the examples in the theme decisions.

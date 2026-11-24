# web-shared-formatting

`@shelvio/web/shared/formatting` (`scope:web`, `type:util`): dates, money and ISBNs the Polish way, from one place (spec "Translation and formatting", theme decisions "Formatting").

## Dates

- `dateFormat` (`dd.MM.yyyy`) is the only date format in the interface: display, the datepicker (typed and shown dates, and the calendar's accessible labels) and parsing all read it. Change it there and nowhere else. "Dodano …" uses it too; there is no long form like "14 maja 2022".
- `provideDateFormat()` is in the app config. It runs the Material datepicker on `@angular/material-date-fns-adapter` with the `pl` locale, so a typed `14.05.2022` parses (the native adapter can't parse it). An ISO `2022-05-14` typed into the input is accepted too.
- `formatDisplayDate(value)` → `14.05.2022`, and in templates the `displayDate` pipe (`DisplayDatePipe`): `{{ item.purchaseDate | displayDate }}`. It takes a `Date`, a `yyyy-MM-dd` day or an ISO timestamp (shown as its local day), and shows nothing for `null` or `undefined`.
- Date-only values (a purchase date) travel as `yyyy-MM-dd` with no time or timezone: `toIsoDate(date)` before sending, `fromIsoDate('2022-05-14')` after receiving (it reads only a `yyyy-MM-dd` day). Both use the local calendar day; `toISOString()` and `new Date('2022-05-14')` go through UTC and can shift it by a day.

## Money

Amounts are PLN only and stored in grosze (minor units).

- `formatMoney(142000)` → "1420,00 zł", `formatMoney(1420000)` → "14 200,00 zł" (`pl-PL`: four-digit amounts aren't grouped; the spaces are no-break spaces). In templates: `{{ priceMinor | money }}` (`MoneyPipe`), which shows nothing for `null` or `undefined`.
- `parseAmount(text)` reads a typed amount into grosze: a comma or a dot, at most two decimals ("14,20", "14.2", "1420"). Anything else (a sign, a third decimal, group separators, letters, an empty string) is `null`.

## ISBN

ISBNs are stored as 13 digits. `hyphenateIsbn('9788308049181')` → "978-83-08-04918-1", by the publisher ranges `isbn3` ships; a value that isn't a valid ISBN is shown as it is. In templates: `{{ book.isbn | isbn }}` (`IsbnPipe`), which shows nothing when there is no ISBN.

Both come from the secondary entry point `@shelvio/web/shared/formatting/isbn`. `isbn3` is CommonJS with about 40 kB of range data that can't be tree-shaken, and the app config imports the main entry point, so keeping it apart leaves it out of the initial bundle; only the lazy features that show ISBNs load it.

Year, page count, volume number and catalogue number are plain text, never number-formatted.

## Tests

`vite.config.mts` pins the test timezone to `Europe/Warsaw`, so a day shifted through UTC fails the tests on a UTC machine such as CI too.

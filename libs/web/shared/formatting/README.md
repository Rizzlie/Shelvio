# web-shared-formatting

`@shelvio/web/shared/formatting` (`scope:web`, `type:util`): dates the Polish way, from one place (spec "Translation and formatting", theme decisions "Formatting").

## Dates

- `dateFormat` (`dd.MM.yyyy`) is the only date format in the interface: display, the datepicker (typed and shown dates, and the calendar's accessible labels) and parsing all read it. Change it there and nowhere else. "Dodano …" uses it too; there is no long form like "14 maja 2022".
- `provideDateFormat()` is in the app config. It runs the Material datepicker on `@angular/material-date-fns-adapter` with the `pl` locale, so a typed `14.05.2022` parses (the native adapter can't parse it). An ISO `2022-05-14` typed into the input is accepted too.
- `formatDisplayDate(value)` → `14.05.2022`, and in templates the `displayDate` pipe (`DisplayDatePipe`): `{{ item.purchaseDate | displayDate }}`. It takes a `Date`, a `yyyy-MM-dd` day or an ISO timestamp (shown as its local day), and shows nothing for `null` or `undefined`.
- Date-only values (a purchase date) travel as `yyyy-MM-dd` with no time or timezone: `toIsoDate(date)` before sending, `fromIsoDate('2022-05-14')` after receiving (it reads only a `yyyy-MM-dd` day). Both use the local calendar day; `toISOString()` and `new Date('2022-05-14')` go through UTC and can shift it by a day.

## Tests

`vite.config.mts` pins the test timezone to `Europe/Warsaw`, so a day shifted through UTC fails the tests on a UTC machine such as CI too.

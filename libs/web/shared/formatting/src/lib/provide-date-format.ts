import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { MAT_DATE_LOCALE, MatDateFormats } from '@angular/material/core';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { pl } from 'date-fns/locale';
import { dateFormat } from './date-format';

/**
 * The datepicker's `date-fns` patterns. Typed and shown dates, and the calendar's accessible
 * labels, all use `dateFormat`: there is no long form like "14 maja 2022".
 */
const dateFormats = {
  parse: { dateInput: dateFormat },
  display: {
    dateInput: dateFormat,
    monthYearLabel: 'LLL yyyy',
    dateA11yLabel: dateFormat,
    monthYearA11yLabel: 'LLLL yyyy',
  },
} satisfies MatDateFormats;

/**
 * Dates in the Polish `dd.MM.yyyy` format: the Material datepicker on `date-fns` with the `pl`
 * locale, which (unlike the native adapter) parses a typed `14.05.2022`.
 */
export function provideDateFormat(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideDateFnsAdapter(dateFormats),
    { provide: MAT_DATE_LOCALE, useValue: pl },
  ]);
}

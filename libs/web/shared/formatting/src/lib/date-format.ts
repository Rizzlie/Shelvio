import { format, parseISO } from 'date-fns';

/**
 * The one date format of the interface (theme decisions, "Dates"): display, the datepicker and
 * parsing all read it, so changing it is a one-line change. A `date-fns` pattern.
 */
export const dateFormat = 'dd.MM.yyyy';

/**
 * A date in `dateFormat`, or `''` when there is none. Takes a `Date` or an API value: a
 * `yyyy-MM-dd` day or an ISO timestamp, shown as its local day ("Dodano 14.05.2022").
 */
export function formatDisplayDate(value: Date | string | null | undefined): string {
  if (value === null || value === undefined) return '';
  return format(typeof value === 'string' ? parseISO(value) : value, dateFormat);
}

import { formatISO, parse } from 'date-fns';

/** How date-only values travel to and from the API. */
const isoDateFormat = 'yyyy-MM-dd';

/**
 * Date-only values (a purchase date) travel to and from the API as `yyyy-MM-dd`, with no time or
 * timezone (theme decisions, "Dates"). Both sides use the local calendar day: `toISOString()`
 * and `new Date('2022-05-14')` would go through UTC and can shift the day.
 */
export function toIsoDate(date: Date): string {
  return formatISO(date, { representation: 'date' });
}

/** The local midnight of a `yyyy-MM-dd` day; an invalid date for anything else. */
export function fromIsoDate(isoDate: string): Date {
  return parse(isoDate, isoDateFormat, new Date());
}

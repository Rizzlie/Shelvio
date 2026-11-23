import { asIsbn13 } from 'isbn3';

/**
 * A stored 13-digit ISBN hyphenated by the publisher ranges of its registration group
 * (theme decisions, "ISBN"): `9788308049181` → "978-83-08-04918-1". The ranges come from
 * `isbn3`. A value that isn't a valid ISBN is shown as it is.
 */
export function hyphenateIsbn(isbn13: string): string {
  return asIsbn13(isbn13, true) ?? isbn13;
}

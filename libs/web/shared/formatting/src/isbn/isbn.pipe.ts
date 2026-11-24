import { Pipe, PipeTransform } from '@angular/core';
import { hyphenateIsbn } from './isbn';

/** `{{ book.isbn | isbn }}` → "978-83-08-04918-1"; nothing when there is no ISBN. */
@Pipe({ name: 'isbn' })
export class IsbnPipe implements PipeTransform {
  transform(isbn13: string | null | undefined): string {
    return isbn13 ? hyphenateIsbn(isbn13) : '';
  }
}

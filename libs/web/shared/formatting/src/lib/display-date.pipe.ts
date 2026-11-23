import { Pipe, PipeTransform } from '@angular/core';
import { formatDisplayDate } from './date-format';

/** `{{ item.purchaseDate | displayDate }}` → "14.05.2022"; see `formatDisplayDate`. */
@Pipe({ name: 'displayDate' })
export class DisplayDatePipe implements PipeTransform {
  transform(value: Date | string | null | undefined): string {
    return formatDisplayDate(value);
  }
}

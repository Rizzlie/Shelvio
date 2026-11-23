import { Pipe, PipeTransform } from '@angular/core';
import { formatMoney } from './money';

/** `{{ item.purchasePriceMinor | money }}` → "1420,00 zł"; nothing when there is no price. */
@Pipe({ name: 'money' })
export class MoneyPipe implements PipeTransform {
  transform(minor: number | null | undefined): string {
    return typeof minor === 'number' ? formatMoney(minor) : '';
  }
}

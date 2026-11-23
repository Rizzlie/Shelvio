import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MoneyPipe } from './money.pipe';

@Component({ imports: [MoneyPipe], template: '{{ price() | money }}' })
class PurchaseDetails {
  readonly price = input.required<number | null | undefined>();
}

function render(price: number | null | undefined): string {
  const fixture = TestBed.createComponent(PurchaseDetails);
  fixture.componentRef.setInput('price', price);
  fixture.detectChanges();
  return fixture.nativeElement.textContent;
}

describe('money pipe', () => {
  it('shows a price in grosze as złoty', () => {
    expect(render(142000)).toBe('1420,00 zł');
  });

  it.each([null, undefined])('shows nothing when the price is %s', (price) => {
    expect(render(price)).toBe('');
  });
});

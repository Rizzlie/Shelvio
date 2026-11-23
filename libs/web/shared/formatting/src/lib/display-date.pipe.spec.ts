import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DisplayDatePipe } from './display-date.pipe';

@Component({ imports: [DisplayDatePipe], template: '{{ value() | displayDate }}' })
class AddedOn {
  readonly value = input.required<Date | string | null | undefined>();
}

function render(value: Date | string | null | undefined): string {
  const fixture = TestBed.createComponent(AddedOn);
  fixture.componentRef.setInput('value', value);
  fixture.detectChanges();
  return fixture.nativeElement.textContent;
}

describe('displayDate', () => {
  it('shows a date as dd.MM.yyyy', () => {
    expect(render(new Date(2022, 4, 4))).toBe('04.05.2022');
  });

  it('shows a yyyy-MM-dd value from the API as that day', () => {
    expect(render('2022-05-14')).toBe('14.05.2022');
  });

  it('shows a timestamp from the API as its local day', () => {
    expect(render('2022-05-13T22:30:00Z')).toBe('14.05.2022');
  });

  it.each([null, undefined])('shows nothing for %s', (value) => {
    expect(render(value)).toBe('');
  });
});

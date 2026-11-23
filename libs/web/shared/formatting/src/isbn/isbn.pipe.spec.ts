import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IsbnPipe } from './isbn.pipe';

@Component({ imports: [IsbnPipe], template: '{{ isbn() | isbn }}' })
class EditionDetails {
  readonly isbn = input.required<string | null | undefined>();
}

function render(isbn: string | null | undefined): string {
  const fixture = TestBed.createComponent(EditionDetails);
  fixture.componentRef.setInput('isbn', isbn);
  fixture.detectChanges();
  return fixture.nativeElement.textContent;
}

describe('isbn pipe', () => {
  it('shows a stored ISBN hyphenated', () => {
    expect(render('9788308049181')).toBe('978-83-08-04918-1');
  });

  it.each([null, undefined])('shows nothing when the ISBN is %s', (isbn) => {
    expect(render(isbn)).toBe('');
  });
});

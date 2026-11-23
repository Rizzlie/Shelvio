import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatIcon } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { provideTheme } from './provide-theme';

@Component({ imports: [MatIcon], template: '<mat-icon [fontIcon]="icon" />' })
class Page {
  protected readonly icon = 'home';
}

describe('provideTheme', () => {
  it('draws icons with Material Symbols', () => {
    TestBed.configureTestingModule({ providers: [provideTheme()] });
    const fixture = TestBed.createComponent(Page);
    fixture.detectChanges();

    const icon: HTMLElement = fixture.debugElement.query(By.css('mat-icon')).nativeElement;
    expect(icon.classList).toContain('material-symbols-outlined');
  });
});

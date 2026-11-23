import { Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

/**
 * The same answer whether a thing is missing or hidden from the person, so the screen never
 * reveals that a collection or item exists.
 */
@Component({
  imports: [TranslocoPipe],
  selector: 'app-not-found-page',
  template: `
    <main>
      <h1>{{ 'notFound.page.message' | transloco }}</h1>
    </main>
  `,
  styles: `
    :host {
      display: grid;
      place-items: center;
      min-height: 100dvh;
      padding: 24px;
      box-sizing: border-box;
    }

    main {
      max-width: 32rem;
      padding: 32px;
      background: var(--mat-sys-surface);
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: var(--mat-sys-corner-large);
    }

    h1 {
      margin: 0;
      font: var(--mat-sys-headline-small);
      color: var(--mat-sys-on-surface);
    }
  `,
})
export class NotFoundPage {}

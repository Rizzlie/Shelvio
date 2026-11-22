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
})
export class NotFoundPage {}

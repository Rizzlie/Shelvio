import { Component, inject } from '@angular/core';
import { CurrentUserStore } from '@shelvio/web/identity/data-access';

/** The signed-in landing page until the app shell (ticket 17) replaces it: who is signed in. */
@Component({
  selector: 'app-home-page',
  template: `
    <main>
      <h1>{{ currentUser.me()?.name ?? currentUser.me()?.email }}</h1>
    </main>
  `,
  styles: `
    main {
      padding: 24px 16px;
    }

    h1 {
      margin: 0;
      font: var(--mat-sys-headline-small);
      color: var(--mat-sys-on-surface);
    }
  `,
})
export class HomePage {
  protected readonly currentUser = inject(CurrentUserStore);
}

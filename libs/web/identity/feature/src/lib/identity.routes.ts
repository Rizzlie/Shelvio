import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

const identityScope = provideTranslocoScope({
  scope: 'identity',
  loader: { pl: () => import('../i18n/pl.json') },
});

/**
 * Mount at `SIGN_IN_PATH` (`@shelvio/web/identity/data-access`) with `withComponentInputBinding()`;
 * the `returnTo` query param is the page to come back to.
 */
export const signInRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./sign-in-page').then((m) => m.SignInPage),
    providers: [identityScope],
  },
];

/**
 * Mount at `NO_ACCESS_PATH` (`@shelvio/shared/contracts`) with `withComponentInputBinding()`; the
 * API's sign-in callback sends a refused person there with the refusal as the `code` query param.
 */
export const noAccessRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./no-access-page').then((m) => m.NoAccessPage),
    providers: [identityScope],
  },
];

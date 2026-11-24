import { Routes } from '@angular/router';
import { NO_ACCESS_PATH } from '@shelvio/shared/contracts';
import { SIGN_IN_PATH, signedIn } from '@shelvio/web/identity/data-access';

/** A router path is the URL path without its leading `/`. */
const routePath = (urlPath: string) => urlPath.slice(1);

/**
 * Public: sign-in, no access and 404. Everything under the guarded `''` route needs a signed-in
 * person; an address none of these match is the 404, signed in or not.
 */
export const appRoutes: Routes = [
  {
    path: routePath(SIGN_IN_PATH),
    loadChildren: () => import('@shelvio/web/identity/feature').then((m) => m.signInRoutes),
  },
  {
    path: routePath(NO_ACCESS_PATH),
    loadChildren: () => import('@shelvio/web/identity/feature').then((m) => m.noAccessRoutes),
  },
  {
    path: '',
    canActivate: [signedIn],
    children: [
      // Until the app shell (ticket 17), the signed-in landing page only names the person.
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./home-page').then((m) => m.HomePage),
      },
    ],
  },
  {
    path: '**',
    loadChildren: () => import('@shelvio/web/not-found/feature').then((m) => m.notFoundRoutes),
  },
];

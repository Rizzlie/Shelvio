import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

/** Mount under any path, such as `'**'`; the screen keeps the URL the person opened. */
export const notFoundRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./not-found-page').then((m) => m.NotFoundPage),
    providers: [
      provideTranslocoScope({ scope: 'notFound', loader: { pl: () => import('../i18n/pl.json') } }),
    ],
  },
];

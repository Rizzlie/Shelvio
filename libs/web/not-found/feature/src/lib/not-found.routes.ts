import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';
import { NotFoundPage } from './not-found-page';

/** Mount under any path, such as `'**'`; the screen keeps the URL the person opened. */
export const notFoundRoutes: Routes = [
  {
    path: '',
    component: NotFoundPage,
    providers: [
      provideTranslocoScope({ scope: 'notFound', loader: { pl: () => import('../i18n/pl.json') } }),
    ],
  },
];

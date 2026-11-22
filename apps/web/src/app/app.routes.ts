import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '**',
    loadChildren: () => import('@shelvio/web/not-found/feature').then((m) => m.notFoundRoutes),
  },
];

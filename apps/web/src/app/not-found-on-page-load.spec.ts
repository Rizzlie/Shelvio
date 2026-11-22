import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withNavigationErrorHandler } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideI18n } from '@shelvio/web/shared/i18n';
import { throwError } from 'rxjs';
import { appRoutes } from './app.routes';
import { notFoundOnPageLoad } from './not-found-on-page-load';

@Component({ template: '' })
class CollectionPage {}

const problem = (status: number, code: string) =>
  new HttpErrorResponse({
    status,
    url: '/api/collections/123',
    error: { type: 'about:blank', title: '', status, code, params: {} },
  });

/** A page whose data fails to load with `error`, next to the app's own routes. */
function setUp(error: HttpErrorResponse) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(
        [
          {
            path: 'kolekcje/:id',
            component: CollectionPage,
            resolve: { collection: () => throwError(() => error) },
          },
          ...appRoutes,
        ],
        withNavigationErrorHandler(notFoundOnPageLoad),
      ),
      provideI18n(),
    ],
  });
}

describe('notFoundOnPageLoad', () => {
  it.each(['common.notFound', 'collection.notFound'])(
    'shows the 404 screen when a page load gets a 404 problem (%s), keeping the URL',
    async (code) => {
      setUp(problem(404, code));
      const harness = await RouterTestingHarness.create();

      await harness.navigateByUrl('/kolekcje/123').catch(() => undefined);

      await vi.waitFor(() =>
        expect(harness.routeNativeElement?.textContent?.trim()).toBe(
          'Nie znaleziono — ta kolekcja lub pozycja nie istnieje albo nie masz do niej dostępu.',
        ),
      );
      expect(TestBed.inject(Location).path()).toBe('/kolekcje/123');
    },
  );

  it('leaves other problems to the caller', async () => {
    setUp(problem(403, 'common.forbidden'));
    const harness = await RouterTestingHarness.create();

    await expect(harness.navigateByUrl('/kolekcje/123')).rejects.toMatchObject({ status: 403 });
  });
});

import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideI18n } from '@shelvio/web/shared/i18n';
import { appRoutes } from './app.routes';

const notFound =
  'Nie znaleziono — ta kolekcja lub pozycja nie istnieje albo nie masz do niej dostępu.';

describe('app routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(appRoutes), provideI18n()] });
  });

  it('shows the 404 screen for an unknown route and keeps its URL', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/kolekcje/nie-ma-takiej');

    await vi.waitFor(() => {
      harness.detectChanges();
      expect(harness.routeNativeElement?.textContent?.trim()).toBe(notFound);
    });
    expect(TestBed.inject(Router).url).toBe('/kolekcje/nie-ma-takiej');
  });
});

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import type { Me } from '@shelvio/shared/contracts';
import { provideI18n } from '@shelvio/web/shared/i18n';
import { appRoutes } from './app.routes';

const notFound =
  'Nie znaleziono — ta kolekcja lub pozycja nie istnieje albo nie masz do niej dostępu.';

const ada: Me = {
  id: '01936b4e-5f2a-7c3d-8e9f-0a1b2c3d4e5f',
  email: 'ada@example.com',
  name: 'Ada Lovelace',
  avatarUrl: null,
};

describe('app routes', () => {
  let harness: RouterTestingHarness;
  let api: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(appRoutes, withComponentInputBinding()),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideI18n(),
      ],
    });
    harness = await RouterTestingHarness.create();
    api = TestBed.inject(HttpTestingController);
  });

  afterEach(() => api.verify());

  /** Opens `url`, answering the sign-in check with `me` (`null`: signed out). */
  async function open(url: string, me: Me | null) {
    const navigation = harness.navigateByUrl(url);
    await vi.waitFor(() =>
      me
        ? api.expectOne('/api/me').flush(me)
        : api.expectOne('/api/me').flush(null, { status: 401, statusText: 'Unauthorized' }),
    );
    await navigation;
  }

  const shownText = () => harness.routeNativeElement?.textContent?.trim();

  it('shows the 404 screen for an unknown route and keeps its URL, without asking who is signed in', async () => {
    await harness.navigateByUrl('/kolekcje/nie-ma-takiej');

    // The scope's translations load after the route renders; the pipe then updates the screen.
    await vi.waitFor(() => expect(shownText()).toBe(notFound));
    expect(TestBed.inject(Router).url).toBe('/kolekcje/nie-ma-takiej');
  });

  it('shows a signed-out person the sign-in screen', async () => {
    await open('/', null);

    expect(TestBed.inject(Router).url).toBe('/logowanie');
    await vi.waitFor(() => expect(shownText()).toContain('Zaloguj przez Google'));
  });

  it('shows a signed-in person their landing page with their name', async () => {
    await open('/', ada);

    expect(TestBed.inject(Router).url).toBe('/');
    expect(shownText()).toBe('Ada Lovelace');
  });

  it('shows the no-access screen without asking who is signed in', async () => {
    await harness.navigateByUrl('/brak-dostepu?code=auth.inviteOnly');

    await vi.waitFor(() => expect(shownText()).toContain('Shelvio działa na zaproszenia.'));
  });
});

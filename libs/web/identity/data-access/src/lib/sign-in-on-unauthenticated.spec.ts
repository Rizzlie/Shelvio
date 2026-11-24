import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import type { Me } from '@shelvio/shared/contracts';
import { firstValueFrom } from 'rxjs';
import { CurrentUserStore } from './current-user-store';
import { signInOnUnauthenticated } from './sign-in-on-unauthenticated';
import { signedIn } from './signed-in.guard';

@Component({ template: '' })
class Page {}

const ada: Me = {
  id: '01936b4e-5f2a-7c3d-8e9f-0a1b2c3d4e5f',
  email: 'ada@example.com',
  name: 'Ada Lovelace',
  avatarUrl: null,
};

const sessionExpired = [
  { type: 'about:blank', title: '', status: 401, code: 'auth.unauthenticated', params: {} },
  { status: 401, statusText: 'Unauthorized' },
] as const;

describe('signInOnUnauthenticated', () => {
  let harness: RouterTestingHarness;
  let api: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'logowanie', component: Page },
          {
            path: '',
            canActivate: [signedIn],
            children: [
              { path: 'kolekcje/:id', component: Page },
              {
                path: 'pozycje/:id',
                component: Page,
                resolve: { item: () => TestBed.inject(HttpClient).get('/api/items/7') },
              },
            ],
          },
        ]),
        provideHttpClient(withInterceptors([signInOnUnauthenticated])),
        provideHttpClientTesting(),
      ],
    });
    harness = await RouterTestingHarness.create();
    api = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => api.verify());

  async function signInAt(url: string) {
    const navigation = harness.navigateByUrl(url);
    await vi.waitFor(() => api.expectOne('/api/me').flush(ada));
    await navigation;
  }

  it('sends the person to sign in when their session ends mid-visit, to come back afterwards', async () => {
    await signInAt('/kolekcje/123');

    const request = firstValueFrom(TestBed.inject(HttpClient).get('/api/collections/123'));
    api.expectOne('/api/collections/123').flush(...sessionExpired);

    await expect(request).rejects.toMatchObject({ status: 401 });
    await vi.waitFor(() => expect(router.url).toBe('/logowanie?returnTo=%2Fkolekcje%2F123'));
    expect(TestBed.inject(CurrentUserStore).me()).toBeNull();
  });

  it('comes back to the page that was opening when its data got the 401', async () => {
    await signInAt('/kolekcje/123');

    const navigation = harness.navigateByUrl('/pozycje/7').catch(() => undefined);
    await vi.waitFor(() => api.expectOne('/api/items/7').flush(...sessionExpired));
    await navigation;

    await vi.waitFor(() => expect(router.url).toBe('/logowanie?returnTo=%2Fpozycje%2F7'));
  });

  it('leaves other failures to the caller', async () => {
    await signInAt('/kolekcje/123');

    const request = firstValueFrom(TestBed.inject(HttpClient).get('/api/collections/123'));
    api.expectOne('/api/collections/123').flush(null, { status: 403, statusText: 'Forbidden' });

    await expect(request).rejects.toMatchObject({ status: 403 });
    expect(router.url).toBe('/kolekcje/123');
  });

  it("doesn't step in when opening the app signed out; the guard carries the deep link", async () => {
    const navigation = harness.navigateByUrl('/kolekcje/123');
    await vi.waitFor(() => api.expectOne('/api/me').flush(...sessionExpired));
    await navigation;

    expect(router.url).toBe('/logowanie?returnTo=%2Fkolekcje%2F123');
  });
});

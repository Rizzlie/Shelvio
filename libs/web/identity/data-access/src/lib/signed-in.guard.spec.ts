import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import type { Me } from '@shelvio/shared/contracts';
import { CurrentUserStore } from './current-user-store';
import { signedIn } from './signed-in.guard';

@Component({ template: '' })
class Page {}

const ada: Me = {
  id: '01936b4e-5f2a-7c3d-8e9f-0a1b2c3d4e5f',
  email: 'ada@example.com',
  name: 'Ada Lovelace',
  avatarUrl: null,
};

const unauthenticated = {
  status: 401,
  statusText: 'Unauthorized',
};

describe('signedIn', () => {
  let harness: RouterTestingHarness;
  let api: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'login', component: Page },
          {
            path: '',
            canActivate: [signedIn],
            children: [{ path: 'kolekcje/:id', component: Page }],
          },
        ]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    harness = await RouterTestingHarness.create();
    api = TestBed.inject(HttpTestingController);
  });

  afterEach(() => api.verify());

  /** Opens `url`, answering the guard's `GET /api/me` with `answer`. */
  async function open(url: string, answer: (request: ReturnType<typeof api.expectOne>) => void) {
    const navigation = harness.navigateByUrl(url);
    await vi.waitFor(() => answer(api.expectOne({ method: 'GET', url: '/api/me' })));
    await navigation;
  }

  it('lets a signed-in person in and knows who they are', async () => {
    await open('/kolekcje/123', (me) => me.flush(ada));

    expect(TestBed.inject(Router).url).toBe('/kolekcje/123');
    expect(TestBed.inject(CurrentUserStore).me()).toEqual(ada);
  });

  it('sends a signed-out person to sign in, carrying the page they asked for', async () => {
    await open('/kolekcje/123?widok=lista', (me) =>
      me.flush({ code: 'auth.unauthenticated' }, unauthenticated),
    );

    expect(TestBed.inject(Router).url).toBe('/login?returnTo=%2Fkolekcje%2F123%3Fwidok%3Dlista');
  });

  it('asks the API only once per visit', async () => {
    await open('/kolekcje/123', (me) => me.flush(ada));
    await harness.navigateByUrl('/login');

    await harness.navigateByUrl('/kolekcje/456');

    expect(TestBed.inject(Router).url).toBe('/kolekcje/456');
  });

  it('lets other failures through instead of pretending the person is signed out', async () => {
    const navigation = harness.navigateByUrl('/kolekcje/123');
    await vi.waitFor(() =>
      api.expectOne('/api/me').flush(null, { status: 503, statusText: 'Unavailable' }),
    );

    await expect(navigation).rejects.toMatchObject({ status: 503 });
  });
});

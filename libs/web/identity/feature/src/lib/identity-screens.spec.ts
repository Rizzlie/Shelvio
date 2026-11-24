import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideI18n } from '@shelvio/web/shared/i18n';
import { noAccessRoutes, signInRoutes } from './identity.routes';

async function open(url: string) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(
        [
          { path: 'login', loadChildren: () => signInRoutes },
          { path: 'brak-dostepu', loadChildren: () => noAccessRoutes },
        ],
        withComponentInputBinding(),
      ),
      provideI18n(),
    ],
  });
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl(url);
  // The scopes' translations load after the route renders; the pipes then fill in the text.
  await vi.waitFor(() => {
    const texts = [...(harness.routeNativeElement?.querySelectorAll('h1, a') ?? [])];
    expect(texts.length).toBeGreaterThan(0);
    expect(texts.every((element) => element.textContent?.trim())).toBe(true);
  });
  return harness;
}

const link = (harness: RouterTestingHarness, name: string) =>
  [...(harness.routeNativeElement?.querySelectorAll('a') ?? [])].find(
    (a) => a.textContent?.trim() === name,
  );

describe('sign-in screen', () => {
  it('offers signing in with Google, coming back to the page the person asked for', async () => {
    const harness = await open('/login?returnTo=%2Fkolekcje%2F123');

    expect(harness.routeNativeElement?.querySelector('h1')?.textContent?.trim()).toBe('Shelvio');
    expect(link(harness, 'Zaloguj przez Google')?.getAttribute('href')).toBe(
      '/api/auth/google?returnTo=%2Fkolekcje%2F123',
    );
  });

  it('comes back to the start page when no page was asked for', async () => {
    const harness = await open('/login');

    expect(link(harness, 'Zaloguj przez Google')?.getAttribute('href')).toBe(
      '/api/auth/google?returnTo=%2F',
    );
  });
});

describe('no-access screen', () => {
  it('explains that Shelvio is invite-only', async () => {
    const harness = await open('/brak-dostepu?code=auth.inviteOnly');

    expect(harness.routeNativeElement?.querySelector('h1')?.textContent?.trim()).toBe(
      'Shelvio działa na zaproszenia. Poproś właściciela kolekcji o dostęp.',
    );
  });

  it('explains an unverified Google email', async () => {
    const harness = await open('/brak-dostepu?code=auth.emailNotVerified');

    expect(harness.routeNativeElement?.querySelector('h1')?.textContent?.trim()).toBe(
      'Google nie potwierdził Twojego adresu e-mail. Potwierdź go i spróbuj ponownie.',
    );
  });

  it.each(['/brak-dostepu', '/brak-dostepu?code=common.forbidden'])(
    'falls back to the invite-only message (%s)',
    async (url) => {
      const harness = await open(url);

      expect(harness.routeNativeElement?.querySelector('h1')?.textContent?.trim()).toBe(
        'Shelvio działa na zaproszenia. Poproś właściciela kolekcji o dostęp.',
      );
    },
  );

  it('"Wyloguj" goes back to the sign-in screen to try another account', async () => {
    const harness = await open('/brak-dostepu?code=auth.inviteOnly');

    link(harness, 'Wyloguj')?.click();

    await vi.waitFor(() => expect(TestBed.inject(Router).url).toBe('/login'));
  });
});

import { googleSignInHref, returnToOf } from './return-to';

describe('returnToOf', () => {
  it.each(['/', '/kolekcje/123', '/kolekcje/123?widok=lista#półka', '/lista-zyczen'])(
    'keeps the app path %s',
    (path) => {
      expect(returnToOf(path)).toBe(path);
    },
  );

  it.each([
    ['another site', 'https://phishing.example/kolekcje'],
    ['a protocol-relative address', '//phishing.example'],
    ['a backslash trick', '/\\phishing.example'],
    ['a relative path without a slash', 'kolekcje/123'],
    ['nothing', undefined],
    ['an empty value', ''],
  ])('returns to the start page instead of %s', (_, value) => {
    expect(returnToOf(value)).toBe('/');
  });

  it.each(['/logowanie', '/logowanie?returnTo=%2Fkolekcje', '/brak-dostepu?code=auth.inviteOnly'])(
    'never returns to a sign-in screen (%s), which would loop',
    (path) => {
      expect(returnToOf(path)).toBe('/');
    },
  );
});

describe('googleSignInHref', () => {
  it("starts the API's Google sign-in with the page to come back to", () => {
    expect(googleSignInHref('/kolekcje/123?widok=lista')).toBe(
      '/api/auth/google?returnTo=%2Fkolekcje%2F123%3Fwidok%3Dlista',
    );
  });

  it('carries only a safe path', () => {
    expect(googleSignInHref('https://phishing.example')).toBe('/api/auth/google?returnTo=%2F');
  });
});

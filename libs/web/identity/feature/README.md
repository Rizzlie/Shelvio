# web-identity-feature

`@shelvio/web/identity/feature` (`scope:web`, `type:feature`): the screens a signed-out person sees. Translations are the lazy `identity` scope in `src/i18n/`.

- `signInRoutes`, mounted at `/login`: "Logowanie", a centered card with the Shelvio wordmark, one tagline and "Zaloguj przez Google". The button is a link to the API's `GET /api/auth/google?returnTo=…`, carrying the `returnTo` query param (see `@shelvio/web/identity/data-access`).
- `noAccessRoutes`, mounted at `NO_ACCESS_PATH` (`/brak-dostepu`): "Brak dostępu", where the API's sign-in callback sends a refused person with the refusal's `code` query param. It shows the shared-scope message for `auth.inviteOnly` ("Shelvio działa na zaproszenia. Poproś właściciela kolekcji o dostęp.") or `auth.emailNotVerified`, and "Wyloguj" back to the sign-in screen to pick another Google account.

Both need `withComponentInputBinding()` in the app's router, which binds the query params to the pages' inputs.

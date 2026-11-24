# web-identity-data-access

`@shelvio/web/identity/data-access` (`scope:web`, `type:data-access`): who is signed in, and getting a signed-out person to the sign-in screen and back.

- `CurrentUserStore` (NgRx SignalStore, root): `me()` is the person from `GET /api/me`, or `null`. `load()` asks the API once per visit and resolves `null` on a 401; `forget()` drops the person when the session ends.
- `signedIn`: a `canActivate` guard for every route but the public screens (sign-in, no access and 404, later also "O aplikacji"). A signed-out person goes to `SIGN_IN_PATH` (`/logowanie`) with the address they opened as `?returnTo=`.
- `signInOnUnauthenticated`: an HTTP interceptor (`provideHttpClient(withInterceptors([signInOnUnauthenticated]))`). A 401 on any later request sends the person to sign in, carrying the current page (or the page being opened) as `returnTo`. The error still reaches the caller.
- `returnToOf(url)` and `googleSignInHref(returnTo)`: only a path inside the app, other than a sign-in screen, is carried; anything else returns to `/`. The API checks `returnTo` again before redirecting, so this is not the security boundary.

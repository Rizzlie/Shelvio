# 12: Sign-in screens (frontend)

**What to build:** A developer opens `localhost:4200` signed out, sees the Polish sign-in card, signs in with real Google (development OAuth client) and lands back on the page they asked for; a refused person sees "Brak dostępu". See the spec's "Frontend shell" and "Local development".

**Blocked by:** 06 (Translations and the 404 screen), 10 (First sign-in (backend)).

**Status:** ready-for-human

- [x] On bootstrap the app calls `GET /me`; 401 shows the public sign-in screen with the current URL carried as `returnTo`.
- [x] Sign-in screen: a centered card with the Shelvio wordmark, one tagline and "Zaloguj przez Google", which starts the API's sign-in route with `returnTo`. (The "O aplikacji" link is added by ticket 19.)
- [x] An HTTP interceptor sends any later 401 to the sign-in screen with the current URL as `returnTo`.
- [x] "Brak dostępu" screen: "Shelvio działa na zaproszenia. Poproś właściciela kolekcji o dostęp." with "Wyloguj", which returns to the sign-in screen.
- [x] Routes other than sign-in, no access and 404 require a signed-in user; until ticket 17 the signed-in landing route shows a minimal page with the user's name.
- [ ] All text via Transloco; screens work at desktop and 390 px widths.
- [x] Local development with a development Google OAuth client (redirect URI under `http://localhost:4200/api/auth/…`) is documented in the README; the API has no bypass.
- [x] Unit tests for `returnTo` handling and the interceptor's redirect.

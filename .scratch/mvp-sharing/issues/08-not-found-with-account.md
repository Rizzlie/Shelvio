# 08: "Nie znaleziono" shows the signed-in account

**What to build:** A signed-in person who opens a collection or item link they have no access to (typically an invitation link opened with the wrong Google account) sees the generic "Nie znaleziono" text plus "Zalogowano jako <email>" and a "Zaloguj innym kontem" button. The button signs them out and starts sign-in with Google's account chooser, returning to the same link. The collection's name is never shown. See the spec's "Frontend: "Nie znaleziono" screen".

**Blocked by:** every ticket in `mvp-browse` (../../mvp-browse/issues/); nothing else in this spec.

**Status:** ready-for-agent

- [ ] With a session, the 404 screen shows "Zalogowano jako <email>" and "Zaloguj innym kontem"; without a session it is unchanged.
- [ ] "Zaloguj innym kontem" ends the current session and starts sign-in with `returnTo` = the current URL.
- [ ] Polish copy in the shared scope.
- [ ] E2E: `contributor` opens the link of a collection `owner` created and did not share, sees its own email and no collection name; "Zaloguj innym kontem" → signing in as `owner` returns to that collection.

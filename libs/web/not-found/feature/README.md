# web-not-found-feature

`@shelvio/web/not-found/feature` (`scope:web`, `type:feature`): the public 404 screen, "Nie znaleziono — ta kolekcja lub pozycja nie istnieje albo nie masz do niej dostępu." It gives the same answer whether a thing is missing or hidden from the person.

`notFoundRoutes` is mounted under `'**'` in the app's routes, so any unknown address shows the screen and keeps its URL. The screen's text is in the `notFound` scope (`src/i18n/pl.json`), which loads with the route. This is the example of a feature-owned translation scope (see `@shelvio/web/shared/i18n`).

The screen is tested through the app's routes (`apps/web/src/app/app.routes.spec.ts`).

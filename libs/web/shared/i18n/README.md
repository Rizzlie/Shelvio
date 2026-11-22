# web-shared-i18n

`@shelvio/web/shared/i18n` (`scope:web`, `type:util`): Transloco for the web app and the shared translation scope.

`provideI18n()` (in the app config) makes Polish the only and active language, with ICU plurals (`@jsverse/transloco-messageformat`) and `pl-PL` number and date formats (`@jsverse/transloco-locale`). There is no picker, browser detection or locale in URLs. Translations are bundled as lazy chunks through `import()` of their JSON, not fetched as assets.

## Keys and scopes

Every piece of interface text is a key `<scope>.<area>.<name>` with its Polish text in a `pl.json`. Lint rejects text in templates (see the root `eslint.config.mjs`).

- **Shared scope** (`src/i18n/pl.json`, keys `shared.*`): common text, error messages and the shell. It loads with the app.
- **Feature scopes**: each `libs/web/<name>/feature` owns the scope named after `<name>` in camel case, with its text in `src/i18n/pl.json`. Its routes provide the scope with an inline loader, so it loads with the route:

  ```ts
  providers: [
    provideTranslocoScope({ scope: 'notFound', loader: { pl: () => import('../i18n/pl.json') } }),
  ],
  ```

  The file holds keys without the scope (`page.message`), and templates use them with it (`'notFound.page.message' | transloco`). See `@shelvio/web/not-found/feature`.

- **`ui` components** use the `transloco` pipe for shared keys only. Feature text reaches them through inputs.

Every number in text goes through an ICU `plural`, so it gets the Polish form and the `pl-PL` format: `{count, plural, one {# pozycja} few {# pozycje} many {# pozycji} other {# pozycji}}` gives "1 pozycja", "2 pozycje", "5 pozycji" and "12 345 pozycji". Years, page counts, volumes and catalogue numbers are never formatted as numbers.

## Error messages

`errorMessageKeys` maps every `ErrorCode` from `@shelvio/shared/contracts` to its shared key (`shared.errors.<code>`). It is typed against `ErrorCode`, so a new code doesn't compile until it has a key. `unknownErrorMessageKey` is for errors without a known code.

`problemMessage(error)` turns any error into `{ key, params }`: the problem's code and params for an `HttpErrorResponse` carrying a `problem+json` body with a known code, the generic message for everything else (an unknown code, a network failure, a bug). Show it with `{{ message.key | transloco: message.params }}`. `problemOf(error)` returns the parsed problem itself.

The app handles the rest. A 404 while a route resolves its data shows the 404 screen at the address the person opened, and errors nobody caught appear as a snackbar with their message (`apps/web/src/app/not-found-on-page-load.ts` and `apps/web/src/app/error-messages.ts`).

## Checks

`nx run web:check-translations` runs `transloco-keys-manager find` (configured in the root `transloco.config.cjs`) and fails when a key used in code is missing from its `pl.json` or a `pl.json` key is never used. CI runs it on every PR. Keys built at runtime are invisible to it, so wrap them in `marker()` from `@jsverse/transloco-keys-manager/marker`, as `errorMessageKeys` does.

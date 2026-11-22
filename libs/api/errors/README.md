# api-errors

`@shelvio/api/errors` (`scope:api`, `type:util`): the typed domain errors. They have no Nest imports, so `domain` libraries throw them directly, and each transport maps them in one place. For HTTP, that is the API app's exception filter.

| Error              | When                                                       | HTTP |
| ------------------ | ---------------------------------------------------------- | ---- |
| `NotFound`         | The thing doesn't exist, or the actor may not know it does | 404  |
| `Forbidden`        | The actor is known but not allowed                         | 403  |
| `Conflict`         | Clashes with the current state, such as a duplicate        | 409  |
| `ValidationFailed` | Well-formed input that breaks a rule                       | 400  |
| `Unauthenticated`  | No acting user (no or an invalid session)                  | 401  |

Each one takes a code from `ErrorCode` in `@shelvio/shared/contracts` and optional JSON-serialisable params for the translation, never text:

```ts
throw new NotFound('collection.notFound', { collectionId });
```

Anything else that escapes a route is answered with a 500 `common.unexpected` and logged with its stack. The response carries no details.

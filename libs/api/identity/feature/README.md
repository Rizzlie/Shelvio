# api-identity-feature

`@shelvio/api/identity/feature` (`scope:api`, `type:feature`): the Identity module's Nest module and thin controllers over `@shelvio/api/identity/domain`.

`IdentityModule.forRootAsync({ useFactory })` takes Identity's dependencies (database, Google, allowlist, account hooks, clock) and the web app's origin; the API app wires them in `apps/api/src/app/identity/identity.wiring.ts`.

## Routes (under `/api`)

| Route                       | What it does                                                                                                                                                                                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /auth/google`          | Starts a Google sign-in (`?returnTo=/path` optional) and redirects to Google.                                                                                                                                                                                       |
| `GET /auth/google/callback` | Google's redirect target (`GOOGLE_REDIRECT_URI`). Sets `__Host-session` and redirects to `APP_ORIGIN` + `returnTo`; a refused person goes to `NO_ACCESS_PATH?code=auth.inviteOnly` (or `auth.emailNotVerified`), and a callback that proves no sign-in goes to `/`. |
| `GET /me`                   | The signed-in person (`Me` in `@shelvio/shared/contracts`), or 401 `auth.unauthenticated`.                                                                                                                                                                          |

The `__Host-session` cookie is `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, without `Domain`, and its `Max-Age` matches the session's expiry.

## Protecting a route

```ts
@Controller('collections')
@UseGuards(SessionGuard)
export class CollectionsController {
  @Get()
  list(@CurrentActor() actor: Actor) { … }
}
```

`SessionGuard` answers 401 `auth.unauthenticated` without a live session and resolves the actor; permissions are checked inside the operations, never in guards.

The HTTP behaviour is tested in the API app (`apps/api/src/app/identity/sign-in.spec.ts`), on an in-process Nest app with a real Postgres and the fake OIDC provider.

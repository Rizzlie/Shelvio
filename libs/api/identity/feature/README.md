# api-identity-feature

`@shelvio/api/identity/feature` (`scope:api`, `type:feature`): the Identity module's Nest module and thin controllers over `@shelvio/api/identity/domain`.

`IdentityModule.forRootAsync({ useFactory })` takes Identity's dependencies (database, Google, allowlist, account hooks, clock); the API app wires them in `apps/api/src/app/identity/identity.wiring.ts`.

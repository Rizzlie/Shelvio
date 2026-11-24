# api-identity-domain

`@shelvio/api/identity/domain` (`scope:api`, `type:domain`): the Identity module's domain operations (ADR-0001). Signing in with Google, the admission gate, sessions and the profile of the signed-in user, as plain TypeScript with Drizzle persistence inside and no Nest imports, so the REST adapter (`@shelvio/api/identity/feature`) and the later MCP server call the same code.

Identity owns the `users`, `sessions` and `sign_in_attempts` tables in `@shelvio/api/db`; no other module touches them.

Run `nx test api-identity-domain` (Docker must be running: the tests use a real Postgres).

# Modular monolith with domain operations as the shared seam for REST and MCP

Shelvio's backend is a single NestJS app split into domain modules (Identity, Collections & Access, Catalog, Metadata Lookup, Media), each published as an Nx `domain` library that exposes plain, HTTP-agnostic **domain operations** (`addItem`, `inviteToCollection`, …). REST controllers are a thin adapter over these operations, and the planned MCP server will be a second adapter importing the same libraries, so the extra operations layer exists for that second caller rather than for ceremony. Permission checks run **inside** the operations (every operation receives the acting user and asks Collections & Access), not only in HTTP guards, so any future adapter inherits the same rules and cannot bypass them.

## Considered options

- **Microservices**: rejected; tens of users, one developer, no independent scaling need.
- **Controllers calling the ORM directly**: rejected; the MCP server would have to duplicate business and permission logic.
- **Full hexagonal architecture with ports everywhere**: rejected; seams are introduced only where two adapters really exist (metadata providers, file storage, clock). Persistence stays inside each `domain` library because Postgres is its only adapter, tests included.

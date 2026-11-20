# Technical foundations

Type: grilling
Status: resolved
Blocked by: none
Map: [Shelvio MVP](../map.md)

## Question

What are the technical foundations of the Nx + Angular + NestJS + Postgres codebase?

Decide:
- Nx workspace layout: apps and shared libraries (shared DTOs/types between Angular and Nest?),
- ORM / query layer (Prisma, TypeORM, MikroORM, Drizzle, Kysely) and migrations,
- API style (REST + OpenAPI with a generated client, or another typed approach), and validation,
- Angular conventions: standalone components, signals, state management, UI component library (Angular Material, PrimeNG, Spartan, Tailwind),
- testing strategy (unit, integration with a real Postgres, e2e) and linting and formatting.

## Answer

Recorded as [ADR-0001](../../../docs/adr/0001-modular-monolith-with-domain-operations.md) for the architectural shape; conventions below.

**Shape.** Modular monolith: one NestJS app, one Postgres. Backend modules: **Identity** (users, Google sign-in), **Collections & Access** (collections, membership, roles, invitations; answers "may X do Y in collection Z?"), **Catalog** (items, shelves, tags, genres, wishlist), **Metadata Lookup** (deep module, roughly `lookup({ code | query, itemType }) → Candidate[]`, hiding providers, throttled queue, cache, ISBN validation, fallback order), **Media** (uploads, thumbnails, storage).

**Domain operations.** Each module exposes HTTP-agnostic operations as plain TypeScript classes; REST controllers are a thin adapter; the future MCP server is a second adapter over the same operations. Seams with swappable adapters only where two adapters exist: metadata providers, file storage (R2 / in-memory), clock. Permissions are checked inside operations; Nest guards only check authentication.

**Nx workspace.**
- Apps: `apps/web` (Angular), `apps/api` (NestJS), later `apps/mcp`.
- Each backend module is two libs: `domain` (operations and rules, Drizzle persistence inside, no repository seam) and `feature` (HTTP adapter: controllers and the Nest module).
- `libs/api/db`: all Drizzle tables and a single migration stream. A module touches only its own tables; other modules' data is reached through their operations.
- `libs/shared/contracts`: REST contracts as Zod schemas, used for Nest validation (e.g. `nestjs-zod`), the typed Angular client, OpenAPI, and later MCP tool input schemas.

**Tags and dependency rules** (`@nx/enforce-module-boundaries`), as set by the user (amended: `ui → ui` and `util → util` allowed):

Scope: `scope:web` and `scope:api` never depend on each other; both may depend on `scope:shared`.

Frontend types:

| type | contains | may depend on |
|---|---|---|
| `type:shell` | routing, layout, bootstrap | feature, data-access, ui, util |
| `type:feature` | smart screens, lazy routes | data-access, ui, util |
| `type:data-access` | SignalStores, HTTP client over contracts | util |
| `type:ui` | presentational components (inputs/outputs only) | ui, util |
| `type:util` | pure functions, types | util |

`libs/shared/contracts` is tagged `type:util` + `scope:shared` so data-access may use it, and it may depend on other `util` libs and external packages (Zod).

Backend types: `type:feature` (HTTP adapter) → domain, util; `type:domain` → domain (cross-module calls through public interfaces), data-access, util; `type:data-access` (`libs/api/db`) → util.

**Cross-module communication.** Direct calls to another module's public interface (e.g. Catalog calls Access `assertCan(actor, collectionId, 'item:edit')`). No event bus in the MVP. Deleting a collection cascades via foreign keys; orphaned files in storage are cleaned by a periodic sweep.

**Errors.** Operations throw typed domain errors (`NotFound`, `Forbidden`, `Conflict`, `ValidationFailed`); one Nest exception filter maps them to `application/problem+json`; the frontend shows translated messages keyed by error code; the MCP adapter will map them to tool errors.

**Config.** Environment variables validated with a Zod schema at startup; missing secrets fail fast.

**ORM.** Drizzle (close to SQL, strong TS types, good JSONB/full-text/trigram support, migrations generated from code).

**Frontend.** Standalone components, signals, new control flow; NgRx SignalStore per area; Angular Material 3.

**Testing.** Vitest; tests mostly at the domain-operations interface against a real Postgres (Testcontainers), fakes only for external APIs and file storage; Playwright for a few key e2e flows (sign-in, add item, share collection).

**Background work.** No job queue or Redis in the MVP: `sharp` makes thumbnails on upload; external API calls go through an in-process throttled queue; `pg-boss` is the upgrade path if needed.

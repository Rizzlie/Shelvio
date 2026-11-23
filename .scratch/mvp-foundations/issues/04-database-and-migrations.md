# 04: Database and migrations

**What to build:** A developer changes the Drizzle schema, generates a migration, commits it, and the API applies it automatically on startup, safely even when two instances start at once; CI fails when a schema change lacks a generated migration; tests get a real Postgres. See the spec's "Persistence, migrations and periodic jobs".

**Blocked by:** 02 (CI pipeline), 03 (Configuration and local infrastructure).

**Status:** done

- [x] A `db` library (`type:data-access`, `scope:api`) holds the Drizzle tables and the single migration stream; its conventions are documented there: UUIDv7 primary keys, `created_at`/`updated_at`, enums as text + CHECK generated from shared Zod consts.
- [x] Migrations are generated with `drizzle-kit generate` and committed; a first migration exists (e.g. the job "last run" table used by ticket 16, or an empty baseline).
- [x] The API runs the programmatic Drizzle migrator at startup, before listening, under a Postgres advisory lock.
- [x] Test: two migrator runs started concurrently against one database apply each migration exactly once and both succeed.
- [x] A reusable Vitest fixture starts Postgres with Testcontainers, applies migrations and hands tests a connection; documented for later specs.
- [x] CI step fails when the schema differs from the committed migrations.
- [x] The expand → contract and "no down migrations, fix forward" rules are written down where developers will see them.

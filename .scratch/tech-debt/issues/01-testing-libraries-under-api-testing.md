# 01: All test-only API helpers under `@shelvio/api/testing/*`

**What to build:** Test-only helpers for the API currently live in two shapes. The Testcontainers fixture is a secondary entry point of the `api-db` library, `@shelvio/api/db/testing`; "spec files only" there is a comment and a README line, not a lint rule. The fake OIDC provider is its own library, `@shelvio/api/testing/fake-oidc`, tagged `type:testing`, which the module-boundary rule lets only `*.spec.*` / `*.test.*` files import. Unify on the second shape: every test-only API helper is a `type:testing` library under `libs/api/testing/<name>`, imported as `@shelvio/api/testing/<name>`, and no library has a `/testing` secondary entry point.

**Blocked by:** none. `type:testing` is on `main` (#11). The fake OIDC provider (#12, #13) is already in the target shape and needs no change.

**Status:** ready-for-agent

- [ ] New library `libs/api/testing/db` (`api-testing-db`, tags `scope:api`, `type:testing`, import `@shelvio/api/testing/db`) holds what is now `libs/api/db/src/testing/` (`postgres-container.ts`, `test-database.ts`), with its tests and the same public exports (`useTestDatabase`, …).
- [ ] It uses `api-db` only through `@shelvio/api/db` (`createDatabase`, `Database`, `runMigrations`), never through relative paths into `libs/api/db`. `api-db` exports the location of its migrations folder (today `SOURCE_MIGRATIONS_FOLDER`, computed in `test-database.ts` relative to the file), so the fixture doesn't have to know `api-db`'s layout.
- [ ] Module-boundary rule in `eslint.config.mjs`: the backend `testing` type may also depend on `data-access` (`testing: ['util', 'data-access', 'testing']`).
- [ ] `@shelvio/api/db/testing` is gone: removed from the `tsconfig.base.json` paths, `libs/api/db/src/testing/` deleted, the line in `libs/api/db/README.md` replaced by a pointer to the new library, and the imports in `apps/api/src/app/health/health.spec.ts` and `apps/api/src/app/logging/logging.spec.ts` (and any newer ones) switched to `@shelvio/api/testing/db`.
- [ ] Checked by hand: importing `@shelvio/api/testing/db` from a production file fails `nx lint`, and from a spec file it passes.
- [ ] The convention is written where developers will see it: the `type:testing` comment in `eslint.config.mjs` names the `libs/api/testing/<name>` / `@shelvio/api/testing/<name>` rule, and the spec's "Workspace and module boundaries" section lists `type:testing` next to the other backend types.
- [ ] `nx run-many -t lint test build` and the migrations check pass. Behaviour is unchanged: the same tests run against the same Testcontainers Postgres.

## Notes

- Ticket 13 (e2e environment) will start the fake OIDC provider from files that are not specs. Whatever it does to the test-file glob in `eslint.config.mjs` applies to `@shelvio/api/testing/db` too, so keep a single glob.
- The web side has no test-only helpers yet. If it gets some, `@shelvio/web/testing/<name>` with `type:testing` is the matching shape, but this ticket doesn't create it.

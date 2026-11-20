# 01: Nx workspace with apps and boundary rules

**What to build:** The empty Shelvio monorepo a developer can clone and run: an Nx workspace with the Angular `web` app and the NestJS `api` app, module-boundary tags and rules enforced by lint, Vitest as the test runner, and Angular's dev-server proxy forwarding `/api` to Nest so `localhost:4200` serves a placeholder page that reaches the API on the same origin. See the spec's "Workspace and module boundaries" and "Local development".

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Nx workspace with apps `web` (Angular, standalone components, signals, new control flow, Angular Material 3 installed) and `api` (NestJS); `<html lang="pl">`.
- [ ] `@nx/enforce-module-boundaries` configured with the spec's tags: `scope:web` / `scope:api` / `scope:shared`, frontend `type:shell|feature|data-access|ui|util`, backend `type:feature|domain|data-access|util`, with the allowed dependencies from the spec (incl. `ui → ui`, `util → util`).
- [ ] An empty `shared/contracts` library tagged `type:util` + `scope:shared` exists so the rules can be exercised.
- [ ] A deliberate forbidden import (e.g. a web lib importing an api lib, data-access importing feature) makes lint fail; demonstrated once and then removed.
- [ ] Vitest runs for apps and libraries (`nx test`); one trivial passing test per app.
- [ ] One command serves `api` and `web` together; the dev-server proxy forwards `/api` to Nest; the placeholder page shows a response from an API route under `/api`.
- [ ] Prettier and ESLint configured; `nx affected -t lint test build` passes locally.

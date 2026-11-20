# 01: Nx workspace with apps and boundary rules

**What to build:** The empty Shelvio monorepo a developer can clone and run: an Nx workspace with the Angular `web` app and the NestJS `api` app, module-boundary tags and rules enforced by lint, Vitest as the test runner, and Angular's dev-server proxy forwarding `/api` to Nest so `localhost:4200` serves a placeholder page that reaches the API on the same origin. See the spec's "Workspace and module boundaries" and "Local development".

**Blocked by:** None (can start immediately).

**Status:** done

- [x] Nx workspace with apps `web` (Angular, standalone components, signals, new control flow, Angular Material 3 installed) and `api` (NestJS); `<html lang="pl">`.
- [x] `@nx/enforce-module-boundaries` configured with the spec's tags: `scope:web` / `scope:api` / `scope:shared`, frontend `type:shell|feature|data-access|ui|util`, backend `type:feature|domain|data-access|util`, with the allowed dependencies from the spec (incl. `ui → ui`, `util → util`).
- [x] An empty `shared/contracts` library tagged `type:util` + `scope:shared` exists so the rules can be exercised.
- [x] A deliberate forbidden import (e.g. a web lib importing an api lib, data-access importing feature) makes lint fail; demonstrated once and then removed.
- [x] Vitest runs for apps and libraries (`nx test`); one trivial passing test per app.
- [x] One command serves `api` and `web` together; the dev-server proxy forwards `/api` to Nest; the placeholder page shows a response from an API route under `/api`.
- [x] Prettier and ESLint configured; `nx affected -t lint test build` passes locally.

## Comments

- Implemented on Nx 24.0.6 (latest stable). Angular is held at 22.2.x with `@angular-devkit/architect` overridden to `0.2202.8`, because architect 0.2203 (Angular 22.3) adds an `exports` map that blocks the deep import Nx 24.0.6's Angular adapter uses (`@angular-devkit/architect/node/index.js`). Drop the override and move to Angular 22.3 once an Nx release fixes this.
- `npm run dev` (`nx serve web`) starts `api` and `web`. The placeholder page calls `GET /api/ping` through the proxy. `/health` arrives in ticket 03.
- Boundary demo: three throwaway libs. Lint failed for a web `data-access` lib importing a web `feature` lib, for a web lib importing an `api` lib, and for `shared/contracts` importing `@angular/core`. All three were reported as `@nx/enforce-module-boundaries` errors, then the libs were deleted.
- Apps carry `type:app`, which the spec's tag table doesn't list. They're composition roots and may depend on any library type on their own side (see the comment in `eslint.config.mjs`).

# 05: Contracts, domain errors and HTTP security

**What to build:** Every API error reaches the client as `application/problem+json` with a stable code and parameters, request input is validated by shared Zod contracts, and the API accepts credentialed and state-changing requests only from `APP_ORIGIN`. See the spec's "Domain operations and errors" and the CORS/Origin part of "Identity module → HTTP adapter".

**Blocked by:** 04 (Database and migrations).

**Status:** ready-for-agent

- [ ] `shared/contracts` holds the error-code vocabulary as a shared const (incl. codes used later, such as `auth.inviteOnly` and `auth.emailNotVerified`) and the pattern for REST contracts as Zod schemas; `nestjs-zod` validates request bodies and params with them.
- [ ] Typed domain errors `NotFound`, `Forbidden`, `Conflict`, `ValidationFailed` and `Unauthenticated`, usable from `domain` libraries without Nest imports.
- [ ] One Nest exception filter maps domain errors and Zod validation failures to `problem+json` with `code` and `params` and the right status (404, 403, 409, 400, 401); unexpected errors become 500 without leaking details.
- [ ] CORS allows only `APP_ORIGIN`, with credentials.
- [ ] Every POST/PUT/PATCH/DELETE must carry an `Origin` equal to `APP_ORIGIN`; a missing or foreign Origin → 403 `problem+json`. GET is unaffected.
- [ ] HTTP tests on an in-process Nest app (test-only routes where needed) cover each mapping, CORS and the Origin check.

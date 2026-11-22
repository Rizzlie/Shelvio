# 06: Translations and the 404 screen

**What to build:** All interface text goes through Transloco in Polish, server errors appear as Polish messages keyed by their code, unknown routes show the 404 screen, and CI catches missing or unused translation keys and hard-coded template text. See the spec's "Translation and formatting" and "Frontend shell".

**Blocked by:** 02 (CI pipeline), 05 (Contracts, domain errors and HTTP security).

**Status:** done

- [x] Transloco (`@jsverse/transloco`) configured with Polish as the only and active language; no picker, no browser detection, no locale in URLs.
- [x] One shared scope (common text, error codes, shell) and the convention for lazy per-feature scopes next to each `feature` library, demonstrated by the 404 feature; keys follow `<scope>.<area>.<name>`; `ui` components use the pipe for shared keys only.
- [x] ICU plurals via `@jsverse/transloco-messageformat` (Polish one/few/many verified in a test) and `@jsverse/transloco-locale` for `pl-PL`.
- [x] Frontend error handling: `problem+json` responses are shown as translated messages keyed by `code`, with a generic fallback for unknown codes; a 404 problem on a page load shows the 404 screen.
- [x] Public 404 screen: "Nie znaleziono — ta kolekcja lub pozycja nie istnieje albo nie masz do niej dostępu."; any unknown route shows it.
- [x] CI runs `transloco-keys-manager` and fails on keys missing from `pl.json` or unused keys.
- [x] Lint flags hard-coded text in templates.

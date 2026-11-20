# Translation approach

Type: grilling
Status: resolved
Blocked by: none
Map: [Shelvio MVP](../map.md)

## Question

How is the Angular UI translated, with Polish as the default?

Decide:
- Angular built-in i18n (build per locale) vs. a runtime library (e.g. Transloco, ngx-translate) that allows switching language without a reload,
- where the user's language is stored (browser vs. user profile),
- translating backend-originated text (validation errors, invite emails, genre names),
- date, number and currency formatting per locale.

## Answer

**Library.** Transloco (`@jsverse/transloco`), runtime translation, not `@angular/localize`.

**Languages.** Polish only in the MVP, and the only active language. No language picker, no browser detection, no language stored in the user profile, no locale prefix in URLs. All user-visible text still goes through Transloco, so adding a language later means adding JSON files plus a picker.

**Where translations live.**
- Each `feature` lib owns a Transloco scope next to its code (e.g. `catalog/i18n/pl.json`), lazy-loaded with its route.
- One shared scope holds common text (Save, Cancel, error codes).
- `ui` components may use the `transloco` pipe for shared keys only; feature-specific text reaches them through inputs.
- Key format: `<scope>.<area>.<name>`, e.g. `catalog.addItem.title`.

**Plurals.** ICU MessageFormat via `@jsverse/transloco-messageformat` (Polish one/few/many forms).

**Dates, numbers, currency.** Formatted with `@jsverse/transloco-locale` for `pl-PL`. A purchase price is shown in the item's own currency (default PLN).

**Backend text.** The API never returns translated text: errors are `problem+json` with a code and parameters, translated by the frontend. Emails, if Invitation flow decides to send them, are rendered by the backend in Polish.

**Genre names.** A genre has a stable English slug as its key (e.g. `jazz`, `science-fiction`); its display names live in the database next to the genre list (Polish only for now), so the frontend and the future MCP server read them from one source. The list itself belongs to Genre lists and mapping.

**Checks.** CI runs `transloco-keys-manager` to find keys missing from `pl.json` and keys no longer used; lint flags hard-coded text in templates.

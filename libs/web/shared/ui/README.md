# web-shared-ui

`@shelvio/web/shared/ui` (`scope:web`, `type:ui`): presentational components shared across features. They take data through inputs and report actions through outputs. They never inject stores or call the API. Their own text uses shared translation keys only; feature text comes in through inputs.

- `ThemeSwitch` (`app-theme-switch`): the Jasny / Ciemny / Systemowy toggle for the sidebar. Inputs `mode`, output `modeChange`. See `@shelvio/web/shared/theme`.

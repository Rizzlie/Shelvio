/** Jasny / Ciemny / Systemowy. */
export const themeModes = ['light', 'dark', 'system'] as const;

export type ThemeMode = (typeof themeModes)[number];

export const defaultThemeMode: ThemeMode = 'system';

/**
 * The `localStorage` key holding the chosen mode. The pre-paint script in
 * `apps/web/src/index.html` reads the same key; a test there keeps them in step.
 */
export const themeModeStorageKey = 'shelvio.themeMode';

/**
 * The attribute on `<html>` that `styles.scss` maps to `color-scheme`, so every
 * `light-dark()` token follows it.
 */
export const themeModeAttribute = 'data-theme-mode';

export const isThemeMode = (value: unknown): value is ThemeMode =>
  themeModes.includes(value as ThemeMode);

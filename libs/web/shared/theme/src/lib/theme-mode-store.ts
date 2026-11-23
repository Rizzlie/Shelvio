import { DOCUMENT, effect, inject, InjectionToken } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import {
  defaultThemeMode,
  isThemeMode,
  ThemeMode,
  themeModeAttribute,
  themeModeStorageKey,
} from './theme-mode';

/**
 * Where the chosen mode lives: `localStorage`, or `null` when the browser won't hand it out
 * (reading `window.localStorage` itself throws when site data is blocked).
 */
export const THEME_MODE_STORAGE = new InjectionToken<Storage | null>('THEME_MODE_STORAGE', {
  factory: () => {
    try {
      return inject(DOCUMENT).defaultView?.localStorage ?? null;
    } catch {
      return null;
    }
  },
});

/** Storage may refuse every call; the mode then simply isn't remembered. */
function ignoringStorageErrors<T>(action: () => T, fallback: T): T {
  try {
    return action();
  } catch {
    return fallback;
  }
}

function readThemeMode(storage: Storage | null): ThemeMode {
  const stored = ignoringStorageErrors(() => storage?.getItem(themeModeStorageKey), null);
  return isThemeMode(stored) ? stored : defaultThemeMode;
}

function writeThemeMode(storage: Storage | null, mode: ThemeMode): void {
  ignoringStorageErrors(() => storage?.setItem(themeModeStorageKey, mode), undefined);
}

/**
 * The light/dark mode the app shows: the stored choice, or Systemowy. The page applies the
 * stored choice before Angular starts (`apps/web/src/index.html`); this store keeps `<html>`
 * and storage in step with later choices.
 */
export const ThemeModeStore = signalStore(
  { providedIn: 'root' },
  withState(() => ({ mode: readThemeMode(inject(THEME_MODE_STORAGE)) })),
  withMethods((store) => ({
    select(mode: ThemeMode): void {
      patchState(store, { mode });
    },
  })),
  withHooks({
    onInit(store, storage = inject(THEME_MODE_STORAGE), root = inject(DOCUMENT).documentElement) {
      effect(() => {
        const mode = store.mode();
        root.setAttribute(themeModeAttribute, mode);
        writeThemeMode(storage, mode);
      });
    },
  }),
);

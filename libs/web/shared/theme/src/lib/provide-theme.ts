import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { MAT_ICON_DEFAULT_OPTIONS, MatIconDefaultOptions } from '@angular/material/icon';

/** `<mat-icon>` draws Material Symbols (loaded from Google Fonts in `index.html`). */
const iconDefaults: MatIconDefaultOptions = { fontSet: 'material-symbols-outlined' };

/**
 * The theme's runtime half; the palettes, fonts and mode tokens live in
 * `apps/web/src/styles.scss`.
 */
export function provideTheme(): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: MAT_ICON_DEFAULT_OPTIONS, useValue: iconDefaults }]);
}

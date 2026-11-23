import { Component, input, output } from '@angular/core';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { TranslocoPipe } from '@jsverse/transloco';
import { marker } from '@jsverse/transloco-keys-manager/marker';
import { type ThemeMode, themeModes } from '@shelvio/web/shared/theme';

/** The shared-scope label of each mode, typed so a new mode doesn't compile without one. */
const modeLabels = {
  light: marker('shared.theme.light'),
  dark: marker('shared.theme.dark'),
  system: marker('shared.theme.system'),
} as const satisfies Record<ThemeMode, string>;

const options = themeModes.map((mode) => ({ mode, label: modeLabels[mode] }));

/**
 * Jasny / Ciemny / Systemowy for the sidebar. It only shows `mode` and reports the person's pick
 * through `modeChange` (so `[(mode)]` works); the caller owns the state (`ThemeModeStore`).
 */
@Component({
  imports: [MatButtonToggleGroup, MatButtonToggle, TranslocoPipe],
  selector: 'app-theme-switch',
  template: `
    <mat-button-toggle-group
      hideSingleSelectionIndicator
      [attr.aria-label]="'shared.theme.label' | transloco"
      [value]="mode()"
      (change)="modeChange.emit($event.value)"
    >
      @for (option of options; track option.mode) {
        <mat-button-toggle [value]="option.mode">{{ option.label | transloco }}</mat-button-toggle>
      }
    </mat-button-toggle-group>
  `,
  styles: `
    mat-button-toggle-group {
      display: flex;
    }

    mat-button-toggle {
      flex: 1;
    }
  `,
})
export class ThemeSwitch {
  readonly mode = input.required<ThemeMode>();
  readonly modeChange = output<ThemeMode>();

  protected readonly options = options;
}

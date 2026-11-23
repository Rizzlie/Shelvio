import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  MatButtonToggleGroupHarness,
  MatButtonToggleHarness,
} from '@angular/material/button-toggle/testing';
import { provideI18n } from '@shelvio/web/shared/i18n';
import type { ThemeMode } from '@shelvio/web/shared/theme';
import { ThemeSwitch } from './theme-switch';

@Component({
  imports: [ThemeSwitch],
  template: `<app-theme-switch [mode]="mode()" (modeChange)="chosen.set($event)" />`,
})
class Sidebar {
  readonly mode = signal<ThemeMode>('system');
  readonly chosen = signal<ThemeMode | null>(null);
}

async function renderSwitch() {
  TestBed.configureTestingModule({ providers: [provideI18n()] });
  const fixture = TestBed.createComponent(Sidebar);
  const loader = TestbedHarnessEnvironment.loader(fixture);
  const group = await loader.getHarness(MatButtonToggleGroupHarness);
  const toggles = await group.getToggles();
  await vi.waitFor(async () => expect(await toggles[0].getText()).toBe('Jasny'));
  return { sidebar: fixture.componentInstance, fixture, toggles };
}

async function checkedLabels(toggles: MatButtonToggleHarness[]) {
  const checked = await Promise.all(
    toggles.map(async (toggle) => ((await toggle.isChecked()) ? toggle.getText() : null)),
  );
  return checked.filter((label) => label !== null);
}

describe('ThemeSwitch', () => {
  it('offers Jasny, Ciemny and Systemowy with the current mode selected', async () => {
    const { toggles } = await renderSwitch();

    const labels = await Promise.all(toggles.map((toggle) => toggle.getText()));
    expect(labels).toEqual(['Jasny', 'Ciemny', 'Systemowy']);
    expect(await checkedLabels(toggles)).toEqual(['Systemowy']);
  });

  it('reports the mode the person picks', async () => {
    const { sidebar, toggles } = await renderSwitch();

    await toggles[1].check();

    expect(sidebar.chosen()).toBe('dark');
  });

  it('shows the mode it is given', async () => {
    const { sidebar, fixture, toggles } = await renderSwitch();

    sidebar.mode.set('light');
    fixture.detectChanges();

    expect(await checkedLabels(toggles)).toEqual(['Jasny']);
  });
});

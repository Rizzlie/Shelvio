import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, FormField } from '@angular/forms/signals';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDatepickerInputHarness } from '@angular/material/datepicker/testing';
import { MatInputModule } from '@angular/material/input';
import { provideDateFormat } from './provide-date-format';

@Component({
  imports: [MatInputModule, MatDatepickerModule, FormField],
  template: `
    <input matInput [matDatepicker]="picker" [formField]="purchase.date" />
    <mat-datepicker #picker />
  `,
})
class PurchaseDate {
  readonly model = signal<{ date: Date | null }>({ date: null });
  readonly purchase = form(this.model);
}

async function setUp(date: Date | null = null) {
  TestBed.configureTestingModule({ providers: [provideDateFormat()] });
  const fixture = TestBed.createComponent(PurchaseDate);
  fixture.componentInstance.model.set({ date });
  const input = await TestbedHarnessEnvironment.loader(fixture).getHarness(
    MatDatepickerInputHarness,
  );
  return { model: fixture.componentInstance.model, input };
}

describe('provideDateFormat', () => {
  it('parses a typed 14.05.2022 as 14 May 2022', async () => {
    const { model, input } = await setUp();

    await input.setValue('14.05.2022');

    expect(model().date).toEqual(new Date(2022, 4, 14));
  });

  it('shows a date as dd.MM.yyyy', async () => {
    const { input } = await setUp(new Date(2022, 4, 4));

    expect(await input.getValue()).toBe('04.05.2022');
  });

  it('rejects a day that does not exist', async () => {
    const { model, input } = await setUp();

    await input.setValue('31.02.2022');

    expect(model().date).toBeNull();
  });
});

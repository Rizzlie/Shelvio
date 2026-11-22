import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { TranslocoLocaleService } from '@jsverse/transloco-locale';
import { firstValueFrom } from 'rxjs';
import { provideI18n } from './provide-i18n';

// A test-only key, kept in a variable so the keys check doesn't expect it in `pl.json`.
const itemsKey = 'test.items';
const items = '{count, plural, one {# pozycja} few {# pozycje} many {# pozycji} other {# pozycji}}';

async function setUp() {
  TestBed.configureTestingModule({ providers: [provideI18n()] });
  const transloco = TestBed.inject(TranslocoService);
  await firstValueFrom(transloco.load(transloco.getActiveLang()));
  return transloco;
}

describe('provideI18n', () => {
  it('makes Polish the only and active language', async () => {
    const transloco = await setUp();

    expect(transloco.getActiveLang()).toBe('pl');
    expect(transloco.getAvailableLangs()).toEqual(['pl']);
  });

  it('loads the shared translations', async () => {
    const transloco = await setUp();

    expect(transloco.translate('shared.errors.common.unexpected')).toBe(
      'Coś poszło nie tak. Spróbuj ponownie za chwilę.',
    );
  });

  it.each([
    [1, '1 pozycja'],
    [2, '2 pozycje'],
    [4, '4 pozycje'],
    [5, '5 pozycji'],
    [12, '12 pozycji'],
    [22, '22 pozycje'],
    [25, '25 pozycji'],
    [12345, '12 345 pozycji'],
  ])('picks the Polish plural form for %i', async (count, expected) => {
    const transloco = await setUp();
    transloco.setTranslationKey(itemsKey, items);

    expect(transloco.translate(itemsKey, { count }).replace(/\s/g, ' ')).toBe(expected);
  });

  it('formats numbers for pl-PL', async () => {
    await setUp();
    const locale = TestBed.inject(TranslocoLocaleService);

    expect(locale.getLocale()).toBe('pl-PL');
    expect(locale.localizeNumber(1234.5, 'decimal').replace(/\s/g, ' ')).toBe('1234,5');
  });
});

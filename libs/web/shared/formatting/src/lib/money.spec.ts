import { formatMoney, parseAmount } from './money';

/** `pl-PL` separates groups and the currency with a no-break space, so "zł" never wraps alone. */
const nbsp = ' ';

describe('formatMoney', () => {
  it('shows grosze as złoty with two decimals', () => {
    expect(formatMoney(142000)).toBe(`1420,00${nbsp}zł`);
  });

  it('groups thousands from five digits up, as pl-PL does', () => {
    expect(formatMoney(1420000)).toBe(`14${nbsp}200,00${nbsp}zł`);
  });

  it('shows a price under one złoty', () => {
    expect(formatMoney(5)).toBe(`0,05${nbsp}zł`);
  });
});

describe('parseAmount', () => {
  it.each([
    ['14,20', 1420],
    ['14.20', 1420],
    ['14,2', 1420],
    ['1420', 142000],
    ['0,05', 5],
    ['0.29', 29],
    [' 14,50 ', 1450],
  ])('reads %j as %i grosze', (text, minor) => {
    expect(parseAmount(text)).toBe(minor);
  });

  it.each(['14,234', '-1', '1,2,3', '14,', ',50', '1 420', 'abc', ''])(
    'rejects %j',
    (text) => {
      expect(parseAmount(text)).toBeNull();
    },
  );
});

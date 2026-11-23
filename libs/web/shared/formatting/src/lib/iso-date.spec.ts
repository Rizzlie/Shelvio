import { fromIsoDate, toIsoDate } from './iso-date';

describe('toIsoDate', () => {
  it('sends a picked date as yyyy-MM-dd of the local day', () => {
    expect(toIsoDate(new Date(2022, 4, 14))).toBe('2022-05-14');
  });

  it('keeps the local day just before midnight', () => {
    expect(toIsoDate(new Date(2022, 0, 1, 23, 59))).toBe('2022-01-01');
  });
});

describe('fromIsoDate', () => {
  it('reads yyyy-MM-dd as local midnight of that day', () => {
    expect(fromIsoDate('2022-05-14')).toEqual(new Date(2022, 4, 14));
  });

  it('reads only a day, not a timestamp', () => {
    expect(fromIsoDate('2022-05-14T10:00:00Z').getTime()).toBeNaN();
  });
});

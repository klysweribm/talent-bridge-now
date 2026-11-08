import { isRealDate } from './is-real-date';

describe('isRealDate', () => {
  it.each(['2026-12-01', '2024-02-29', '2026-01-31'])('should accept the real calendar date %s', (value) => {
    expect(isRealDate(value)).toBe(true);
  });

  it.each(['2026-02-30', '2026-13-01', '2026-00-10', '2026-04-31', '2025-02-29', '2026-12-32'])(
    'should reject the impossible date %s without throwing',
    (value) => {
      expect(isRealDate(value)).toBe(false);
    },
  );

  it.each(['2026-1-1', '26-12-01', '2026/12/01', '2026-12-01T00:00:00Z', '', ' 2026-12-01'])(
    'should reject the badly formatted value %j',
    (value) => {
      expect(isRealDate(value)).toBe(false);
    },
  );

  it.each([null, undefined, 20261201, {}, []])('should reject the non-string value %j', (value) => {
    expect(isRealDate(value)).toBe(false);
  });
});

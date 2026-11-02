import { formatShortDate } from './formatShortDate';

describe('formatShortDate', () => {
  it('should format an ISO timestamp as DD/MM/YYYY', () => {
    expect(formatShortDate('2026-03-05T12:00:00.000Z')).toBe('05/03/2026');
  });

  it('should return the raw value when it is not a date', () => {
    expect(formatShortDate('nope')).toBe('nope');
  });
});

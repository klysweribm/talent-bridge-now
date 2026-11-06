import { formatStartDate } from './formatStartDate';

describe('formatStartDate', () => {
  it('should show day, month and year without shifting the day', () => {
    expect(formatStartDate('2026-12-01')).toBe('01/12/2026');
    expect(formatStartDate('2027-01-31')).toBe('31/01/2027');
  });
});

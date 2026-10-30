import { formatAvailability, formatBenchDate } from './formatAvailability';

const NOW = new Date(2026, 9, 30, 23, 59);

describe('formatAvailability', () => {
  it('should return "Disponible ya" when the date is in the past', () => {
    expect(formatAvailability('2026-01-10', NOW)).toBe('Disponible ya');
  });

  it('should return "Disponible ya" when the date is today, even late at night', () => {
    expect(formatAvailability('2026-10-30', NOW)).toBe('Disponible ya');
  });

  it('should return the formatted date when it is in the future', () => {
    expect(formatAvailability('2026-11-05', NOW)).toBe('05/11/2026');
  });

  it('should accept a full ISO datetime', () => {
    expect(formatAvailability('2026-11-05T00:00:00.000Z', NOW)).toBe('05/11/2026');
  });
});

describe('formatBenchDate', () => {
  it('should format YYYY-MM-DD as DD/MM/YYYY', () => {
    expect(formatBenchDate('2025-03-09')).toBe('09/03/2025');
  });
});

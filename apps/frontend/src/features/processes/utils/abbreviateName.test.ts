import { abbreviateName, joinNames } from './abbreviateName';

describe('abbreviateName', () => {
  it('should abbreviate the surname to its initial', () => {
    expect(abbreviateName('Martín Rodríguez')).toBe('Martín R.');
  });
  it('should use the first and last terms for longer names', () => {
    expect(abbreviateName('María José pérez')).toBe('María P.');
  });
  it('should keep a single name and tolerate extra spaces or empty input', () => {
    expect(abbreviateName('  Sofía ')).toBe('Sofía');
    expect(abbreviateName('')).toBe('');
  });
});

describe('joinNames', () => {
  it.each([
    [[], ''], [['A'], 'A'], [['A', 'B'], 'A y B'], [['A', 'B', 'C'], 'A, B y C'],
  ] as const)('should join %j as "%s"', (names, expected) => {
    expect(joinNames(names)).toBe(expected);
  });
});

import { BENCH_SEED_RAW } from './bench-seed.source';
import { validateBenchSeed } from './bench-seed.validator';

const EXPECTED_TOTAL = 30;

function validItem(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    benchCode: 'BN-0001',
    displayName: 'Persona Ficticia',
    primaryRole: 'Backend Developer',
    practice: 'Application Development',
    seniority: 'sr',
    skills: [{ name: 'Java', level: 4, years: 6 }],
    languages: [{ code: 'es', level: 'native' }],
    location: { country: 'Argentina', city: 'Buenos Aires' },
    benchSince: '2026-09-01',
    availableFrom: '2026-11-01',
    status: 'available',
    ...overrides,
  };
}

describe('validateBenchSeed', () => {
  describe('the shipped mock', () => {
    const resources = validateBenchSeed(BENCH_SEED_RAW);

    it('should contain 30 resources with unique codes BN-0001..BN-0030', () => {
      expect(resources).toHaveLength(EXPECTED_TOTAL);
      expect(resources.map((item) => item.benchCode)).toEqual(
        Array.from({ length: EXPECTED_TOTAL }, (_, i) => `BN-${String(i + 1).padStart(4, '0')}`),
      );
    });

    it('should have a seniority distribution close to 6 jr, 10 ssr, 10 sr, 4 lead', () => {
      const count = (seniority: string): number => resources.filter((r) => r.seniority === seniority).length;

      expect([count('jr'), count('ssr'), count('sr'), count('lead')]).toEqual([6, 10, 10, 4]);
    });

    it('should have at least 3 sr resources with Java and Spring Boot and one assigned with Java', () => {
      const names = (skills: readonly { readonly name: string }[]): readonly string[] => skills.map((s) => s.name);
      const javaSpringSr = resources.filter(
        (r) => r.seniority === 'sr' && names(r.skills).includes('Java') && names(r.skills).includes('Spring Boot'),
      );

      expect(javaSpringSr.length).toBeGreaterThanOrEqual(3);
      expect(resources.some((r) => r.status === 'assigned' && names(r.skills).includes('Java'))).toBe(true);
    });

    it('should not carry email or phone fields', () => {
      expect(JSON.stringify(BENCH_SEED_RAW)).not.toMatch(/email|phone|salary|@/i);
    });
  });

});

describe('validateBenchSeed on arbitrary input', () => {
  it('should accept a valid item', () => {
    expect(validateBenchSeed([validItem()])).toHaveLength(1);
  });

  it('should reject a non-array payload', () => {
    expect(() => validateBenchSeed({})).toThrow(/array/);
  });

  it('should name the benchCode and the failing field when an item is invalid', () => {
    expect(() => validateBenchSeed([validItem(), validItem({ benchCode: 'BN-0002', seniority: 'guru' })])).toThrow(
      /BN-0002.*seniority/,
    );
  });

  it('should name the index when the benchCode is missing', () => {
    expect(() => validateBenchSeed([validItem({ benchCode: undefined })])).toThrow(/index 0.*benchCode/);
  });

  it.each([
    ['skills.level', { skills: [{ name: 'Java', level: 9, years: 1 }] }, /skills/],
    ['languages.level', { languages: [{ code: 'es', level: 'fluent' }] }, /languages/],
    ['availableFrom', { availableFrom: 'mañana' }, /availableFrom/],
    ['location', { location: { country: 'Chile' } }, /location/],
    ['an unexpected field', { email: 'x@y.com' }, /email/],
  ])('should reject an item with a bad %s', (_label, override, pattern) => {
    expect(() => validateBenchSeed([validItem(override)])).toThrow(pattern);
  });

  it('should reject duplicated benchCodes', () => {
    expect(() => validateBenchSeed([validItem(), validItem()])).toThrow(/duplicated.*BN-0001/);
  });
});

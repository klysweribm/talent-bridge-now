import { isBenchSeedEnabled } from './bench-seed.config';

function config(values: Record<string, string | undefined>): { get: (key: string) => string | undefined } {
  return { get: (key: string) => values[key] };
}

describe('isBenchSeedEnabled', () => {
  it('should be enabled when BENCH_SEED_ENABLED is exactly "true" outside production', () => {
    expect(isBenchSeedEnabled(config({ NODE_ENV: 'development', BENCH_SEED_ENABLED: 'true' }))).toBe(true);
  });

  it.each(['TRUE', '1', 'false', '', undefined])('should be disabled when the flag is %p', (flag) => {
    expect(isBenchSeedEnabled(config({ NODE_ENV: 'development', BENCH_SEED_ENABLED: flag }))).toBe(false);
  });

  it('should be disabled when NODE_ENV is production even with the flag on', () => {
    expect(isBenchSeedEnabled(config({ NODE_ENV: 'production', BENCH_SEED_ENABLED: 'true' }))).toBe(false);
  });
});

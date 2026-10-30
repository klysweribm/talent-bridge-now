import { ENV, envSchema } from './env';

describe('env', () => {
  it('should expose a resolved VITE_API_URL for the running test environment', () => {
    expect(typeof ENV.VITE_API_URL).toBe('string');
    expect(ENV.VITE_API_URL.length).toBeGreaterThan(0);
  });

  it('should default VITE_API_URL to /api/v1 when it is not set', () => {
    const result = envSchema.parse({});
    expect(result.VITE_API_URL).toBe('/api/v1');
  });

  it('should accept a custom VITE_API_URL', () => {
    const result = envSchema.parse({ VITE_API_URL: 'https://api.example.com/v1' });
    expect(result.VITE_API_URL).toBe('https://api.example.com/v1');
  });

  it('should reject an empty VITE_API_URL', () => {
    expect(() => envSchema.parse({ VITE_API_URL: '' })).toThrow();
  });

  it('should default the idle timer to 360 s timeout and 60 s warning', () => {
    const result = envSchema.parse({});
    expect(result.VITE_IDLE_TIMEOUT_SECONDS).toBe(360);
    expect(result.VITE_IDLE_WARNING_SECONDS).toBe(60);
  });

  it('should coerce idle values given as strings', () => {
    const result = envSchema.parse({ VITE_IDLE_TIMEOUT_SECONDS: '120', VITE_IDLE_WARNING_SECONDS: '30' });
    expect(result.VITE_IDLE_TIMEOUT_SECONDS).toBe(120);
    expect(result.VITE_IDLE_WARNING_SECONDS).toBe(30);
  });

  it('should reject a warning that is not shorter than the timeout', () => {
    expect(() => envSchema.parse({ VITE_IDLE_TIMEOUT_SECONDS: '60', VITE_IDLE_WARNING_SECONDS: '60' })).toThrow();
    expect(() => envSchema.parse({ VITE_IDLE_TIMEOUT_SECONDS: '30', VITE_IDLE_WARNING_SECONDS: '60' })).toThrow();
  });

  it('should reject non-positive or non-integer idle values', () => {
    expect(() => envSchema.parse({ VITE_IDLE_TIMEOUT_SECONDS: '0' })).toThrow();
    expect(() => envSchema.parse({ VITE_IDLE_WARNING_SECONDS: '1.5' })).toThrow();
  });
});

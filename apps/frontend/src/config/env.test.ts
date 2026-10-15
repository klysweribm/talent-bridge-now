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
});

import { Logger } from '@nestjs/common';
import { buildAiConfig } from './ai-config';

const KEY = 'test-key-not-real';
const BASE: Record<string, string> = {
  NODE_ENV: 'development', AI_PROVIDER: 'ica', ICA_API_URL: 'http://ica.invalid/v1/', ICA_API_KEY: KEY, ICA_MODEL_ID: 'm',
  ICA_MAX_TOKENS: '256', ICA_TIMEOUT_MS: '1000', AI_RETRY_MAX_ATTEMPTS: '3', AI_RETRY_BASE_MS: '10', AI_RETRY_MAX_MS: '100', AI_TOTAL_TIMEOUT_MS: '5000',
};
const build = (overrides: Record<string, string | undefined> = {}): ReturnType<typeof buildAiConfig> => {
  const env = { ...BASE, ...overrides };
  return buildAiConfig({ get: (key: string) => env[key] } as never);
};

let logged: unknown[][];
beforeEach(() => {
  logged = [];
  for (const level of ['log', 'warn', 'error'] as const) {
    jest.spyOn(Logger.prototype, level).mockImplementation((...args: unknown[]) => { logged.push(args); });
  }
});
afterEach(() => jest.restoreAllMocks());

describe('buildAiConfig', () => {
  it('should enable ICA with parsed numbers and a normalized URL', () => {
    expect(build()).toEqual({
      enabled: true, provider: 'ica', model: 'm', maxTokens: 256, callTimeoutMs: 1000, totalTimeoutMs: 5000,
      retry: { maxAttempts: 3, baseMs: 10, maxMs: 100 }, ica: { apiUrl: 'http://ica.invalid/v1', apiKey: KEY },
    });
  });

  it.each([
    ['key is absent', { ICA_API_KEY: undefined }],
    ['key is blank', { ICA_API_KEY: '   ' }],
    ['provider is absent', { AI_PROVIDER: undefined }],
    ['provider is unknown', { AI_PROVIDER: 'openai' }],
    ['url is missing', { ICA_API_URL: undefined }],
    ['url is not http(s)', { ICA_API_URL: 'ftp://x' }],
    ['model is missing', { ICA_MODEL_ID: undefined }],
    ['a number is not numeric', { ICA_MAX_TOKENS: 'abc' }],
    ['a number is zero', { ICA_TIMEOUT_MS: '0' }],
    ['a number is missing', { AI_TOTAL_TIMEOUT_MS: undefined }],
  ])('should fail closed to disabled when %s', (_name, overrides) => {
    expect(build(overrides)).toEqual({ enabled: false });
  });

  it('should refuse the fake provider in production', () => {
    expect(build({ AI_PROVIDER: 'fake', NODE_ENV: 'production' })).toEqual({ enabled: false });
  });

  it('should enable the fake provider outside production without needing a key', () => {
    expect(build({ AI_PROVIDER: 'fake', ICA_API_KEY: undefined })).toMatchObject({ enabled: true, provider: 'fake' });
  });

  it('should log the variable names but never the key or any value', () => {
    build({ ICA_API_URL: undefined });
    build({ AI_PROVIDER: 'openai' });
    build({ ICA_API_KEY: undefined });

    const output = JSON.stringify(logged);
    expect(output).toContain('ICA_API_URL');
    expect(output).not.toContain(KEY);
    expect(output).not.toContain('openai');
  });
});

import type { TAiConfig } from '../domain/interfaces/ai-config.interface';

/** Configuración válida con clave FALSA reconocible, solo para tests. */
export const ENABLED_CONFIG: TAiConfig = {
  enabled: true,
  provider: 'ica',
  model: 'test-model',
  maxTokens: 256,
  callTimeoutMs: 1000,
  totalTimeoutMs: 5000,
  retry: { maxAttempts: 1, baseMs: 1, maxMs: 1 },
  ica: { apiUrl: 'http://ica.invalid/v1', apiKey: 'test-key-not-real' },
};

import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { FAKE_MODEL_ID } from '../../domain/constants/ai.constants';
import type { IAiEnabledConfig, TAiConfig } from '../../domain/interfaces/ai-config.interface';

const PRODUCTION_ENV = 'production';
const NUMERIC_VARS = [
  'ICA_MAX_TOKENS', 'ICA_TIMEOUT_MS', 'AI_RETRY_MAX_ATTEMPTS', 'AI_RETRY_BASE_MS', 'AI_RETRY_MAX_MS', 'AI_TOTAL_TIMEOUT_MS',
] as const;
const logger = new Logger('AiConfig');

const disabled = (why: string): TAiConfig => {
  logger.warn(`AI disabled: ${why}`);
  return { enabled: false };
};

function readNumbers(config: Pick<ConfigService, 'get'>): Record<(typeof NUMERIC_VARS)[number], number> | string {
  const values = {} as Record<(typeof NUMERIC_VARS)[number], number>;
  for (const name of NUMERIC_VARS) {
    const value = Number(config.get<string>(name));
    if (!Number.isFinite(value) || value <= 0) return `${name} is missing or not a positive number`;
    values[name] = value;
  }
  return values;
}

type TConfigReader = Pick<ConfigService, 'get'>;
type TNumbers = Record<(typeof NUMERIC_VARS)[number], number>;

function trimmed(config: TConfigReader, name: string): string | undefined {
  return config.get<string>(name)?.trim() || undefined;
}

function baseConfig(provider: 'ica' | 'fake', numbers: TNumbers): Omit<IAiEnabledConfig, 'model'> {
  return {
    enabled: true, provider, maxTokens: numbers.ICA_MAX_TOKENS, callTimeoutMs: numbers.ICA_TIMEOUT_MS,
    totalTimeoutMs: numbers.AI_TOTAL_TIMEOUT_MS,
    retry: { maxAttempts: numbers.AI_RETRY_MAX_ATTEMPTS, baseMs: numbers.AI_RETRY_BASE_MS, maxMs: numbers.AI_RETRY_MAX_MS },
  };
}

function icaConfig(config: TConfigReader, base: Omit<IAiEnabledConfig, 'model'>): TAiConfig {
  const model = trimmed(config, 'ICA_MODEL_ID');
  const apiUrl = trimmed(config, 'ICA_API_URL');
  const apiKey = trimmed(config, 'ICA_API_KEY');
  if (!model) return disabled('ICA_MODEL_ID is missing');
  if (!apiUrl || !/^https?:\/\//.test(apiUrl)) return disabled('ICA_API_URL is missing or not an http(s) URL');
  if (!apiKey) return disabled('ICA_API_KEY is not set');
  return { ...base, model, ica: { apiUrl: apiUrl.replace(/\/+$/, ''), apiKey } };
}

/**
 * Seguridad falla CERRADO: sin clave, con AI_PROVIDER inválido, con una variable no secreta
 * ausente o con `fake` en producción, la IA queda apagada (la app arranca igual). Los logs
 * dicen QUÉ variable falla, nunca su valor. No hay valores por defecto de URL ni modelo.
 */
export function buildAiConfig(config: TConfigReader): TAiConfig {
  const provider = config.get<string>('AI_PROVIDER');
  if (provider !== 'ica' && provider !== 'fake') return disabled('AI_PROVIDER must be "ica" or "fake"');
  if (provider === 'fake' && config.get<string>('NODE_ENV') === PRODUCTION_ENV) {
    return disabled('AI_PROVIDER=fake is not allowed when NODE_ENV=production');
  }
  const numbers = readNumbers(config);
  if (typeof numbers === 'string') return disabled(numbers);
  const base = baseConfig(provider, numbers);
  return provider === 'fake' ? { ...base, model: trimmed(config, 'ICA_MODEL_ID') ?? FAKE_MODEL_ID } : icaConfig(config, base);
}

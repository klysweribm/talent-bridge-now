import type { Logger } from '@nestjs/common';
import { AiProviderError } from '../../domain/errors/ai-provider.error';
import type { IAiRetryConfig } from '../../domain/interfaces/ai-config.interface';
import type { IWithRetryOptions } from './with-retry.util';

const RETRYABLE_STATUS_CODES: readonly number[] = [429, 500, 502, 503, 504];

/**
 * Solo se reintentan fallos transitorios: 429/5xx y fallos de red (ya clasificados
 * como UNREACHABLE sin status). Un 400 (clave, modelo), un TIMEOUT o una salida inválida
 * se repetirían igual, así que nunca se reintentan.
 */
export function isRetryableAiError(error: unknown): boolean {
  if (!(error instanceof AiProviderError)) return false;
  if (error.statusCode === undefined) return error.kind === 'UNREACHABLE';
  return RETRYABLE_STATUS_CODES.includes(error.statusCode);
}

/** Espera abortable: si el tope total de la consulta vence, corta la espera con TIMEOUT. */
export function abortableDelay(ms: number, signal?: AbortSignal): Promise<void> {
  const timeout = (): AiProviderError => new AiProviderError('The total AI time budget was exhausted', 'TIMEOUT');
  if (signal?.aborted) return Promise.reject(timeout());
  return new Promise((resolve, reject) => {
    const onAbort = (): void => { clearTimeout(timer); reject(timeout()); };
    const timer = setTimeout(() => { signal?.removeEventListener('abort', onAbort); resolve(); }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

export function buildAiRetryOptions(retry: IAiRetryConfig, logger: Logger, signal?: AbortSignal): IWithRetryOptions {
  return {
    maxAttempts: retry.maxAttempts,
    isRetryable: isRetryableAiError,
    backoffMs: (attempt) => Math.min(retry.baseMs * 2 ** (attempt - 1), retry.maxMs),
    delay: (ms) => abortableDelay(ms, signal),
    onRetry: (attempt, error, waitMs) => {
      const reason = error instanceof AiProviderError ? error.kind : 'unknown';
      logger.warn(`AI retry: attempt=${attempt}/${retry.maxAttempts} reason=${reason} waitMs=${waitMs}`);
    },
  };
}

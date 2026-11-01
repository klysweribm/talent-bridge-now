/**
 * Reintenta `fn` hasta `maxAttempts` veces, pero solo para errores que `isRetryable`
 * acepta: un error no reintentable falla de inmediato. `delay` es inyectable para que
 * los tests no esperen de verdad.
 */
export interface IWithRetryOptions {
  readonly maxAttempts: number;
  readonly isRetryable: (error: unknown) => boolean;
  readonly backoffMs: (attempt: number) => number;
  readonly delay?: (ms: number) => Promise<void>;
  /** Antes de cada espera, con el intento que acaba de fallar. */
  readonly onRetry?: (attempt: number, error: unknown, waitMs: number) => void;
}

const defaultDelay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Conserva el prototipo (instanceof, `kind`, `statusCode`) y añade el nº de intentos al mensaje. */
function withAttemptsSuffix(error: unknown, attempts: number): unknown {
  if (!(error instanceof Error)) return new Error(`${String(error)} (after ${attempts} attempts)`);
  const suffixed = Object.assign(Object.create(Object.getPrototypeOf(error) as object) as Error, error);
  suffixed.message = `${error.message} (after ${attempts} attempts)`;
  return suffixed;
}

export async function withRetry<T>(fn: () => Promise<T>, options: IWithRetryOptions): Promise<T> {
  const delay = options.delay ?? defaultDelay;
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      if (!options.isRetryable(error)) throw error;
      if (attempt >= options.maxAttempts) throw withAttemptsSuffix(error, attempt);
      const waitMs = options.backoffMs(attempt);
      options.onRetry?.(attempt, error, waitMs);
      await delay(waitMs);
    }
  }
}

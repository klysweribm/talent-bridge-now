export interface IAiRetryConfig {
  readonly maxAttempts: number;
  readonly baseMs: number;
  readonly maxMs: number;
}

export interface IAiEnabledConfig {
  readonly enabled: true;
  readonly provider: 'ica' | 'fake';
  readonly model: string;
  readonly maxTokens: number;
  readonly callTimeoutMs: number;
  readonly totalTimeoutMs: number;
  readonly retry: IAiRetryConfig;
  /** Solo con `provider: 'ica'`. */
  readonly ica?: { readonly apiUrl: string; readonly apiKey: string };
}

/** `enabled: false` = IA apagada (falla cerrado): sin clave, config inválida o `fake` en producción. */
export type TAiConfig = { readonly enabled: false } | IAiEnabledConfig;

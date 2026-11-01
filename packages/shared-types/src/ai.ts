// AI — contrato de la capability `ai` (asistente vía ICA). Solo tipos.
// Principio: el asistente potencia, nunca bloquea. Un fallo de IA es `ok: false`
// (en HTTP, 503), jamás un 401 (el httpClient cerraría la sesión).

export type TAiTopic = 'general';

/** Quién produjo la respuesta. `fake` permite a la UI mostrar una etiqueta "demo". */
export type TAiSource = 'ica' | 'fake';

export type TAiUnavailableReason =
  | 'NOT_CONFIGURED'
  | 'UNAUTHORIZED'
  | 'MODEL_NOT_FOUND'
  | 'UNREACHABLE'
  | 'TIMEOUT'
  | 'RATE_LIMITED'
  | 'TRUNCATED'
  | 'INVALID_OUTPUT';

export interface IAiAskRequest {
  readonly topic: TAiTopic;
  readonly query: string;
}

export interface IAiUsage {
  readonly promptTokens: number;
  readonly completionTokens: number;
}

export interface IAiAskSuccess {
  readonly ok: true;
  readonly answer: string;
  readonly topic: TAiTopic;
  readonly source: TAiSource;
  readonly model: string;
  readonly usage?: IAiUsage;
}

export interface IAiAskFailure {
  readonly ok: false;
  readonly reason: TAiUnavailableReason;
}

export type TAiAskResult = IAiAskSuccess | IAiAskFailure;

/** `GET /ai/status`. Nunca incluye fragmentos de la clave. */
export interface IAiStatus {
  readonly available: boolean;
  readonly source: TAiSource | null;
  readonly model: string | null;
  readonly reason?: TAiUnavailableReason;
}

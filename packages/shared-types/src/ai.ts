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

// ─── Borrador de oportunidad (OPP-AI-1, `POST /ai/opportunity-draft`) ────────

/** Códigos estables de error del borrador. El frontend ramifica por `code`, no por el status HTTP. */
export type TOpportunityDraftErrorCode = 'AI_UNAVAILABLE' | 'AI_TIMEOUT' | 'OPPORTUNITY_TEXT_TOO_LONG';

/** Campos del formulario de la oportunidad que la IA puede proponer. Vacío = `''`, `[]` o `null`: nunca inventado. */
export interface IOpportunityDraftFields {
  readonly title: string;
  readonly clientName: string;
  readonly opportunityRole: string;
  readonly skills: readonly string[];
  /** «Expectativas de evaluación técnica». */
  readonly roleDescription: string;
  /** Entero 6..10, o `null` si el texto no lo permite deducir (p. ej. dice solo «senior»). */
  readonly band: number | null;
  /** `YYYY-MM-DD` real, o `null`. */
  readonly startDate: string | null;
}

export interface IOpportunityDraftRequest {
  readonly text: string;
}

export interface IOpportunityDraftResponse {
  readonly draft: IOpportunityDraftFields;
  /** Campos que la IA no pudo inferir: el formulario los marca «por completar» (R2). */
  readonly missingFields: readonly (keyof IOpportunityDraftFields)[];
  readonly warnings: readonly string[];
}

/** Cuerpo de los errores propios del borrador (503, 504 y el 400 de texto demasiado largo). */
export interface IOpportunityDraftError {
  readonly code: TOpportunityDraftErrorCode;
  readonly message: string;
}

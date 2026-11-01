import type { IAiUsage } from '@ibm-talent-bridge/shared-types';

export type TAiMessageRole = 'system' | 'user' | 'assistant';

export interface IAiMessage {
  readonly role: TAiMessageRole;
  readonly content: string;
}

/** Petición al puerto. Un campo `tools` se podrá añadir de forma aditiva (AI-2). */
export interface IAiCompletionRequest {
  readonly messages: readonly IAiMessage[];
  readonly maxTokens: number;
  readonly jsonMode?: boolean;
  /** Sustituye al modelo configurado. */
  readonly model?: string;
  /** Tope total de la consulta (incluye reintentos y esperas). */
  readonly signal?: AbortSignal;
}

export interface IAiCompletion {
  readonly content: string;
  readonly finishReason: string;
  readonly model: string;
  readonly usage?: IAiUsage;
}

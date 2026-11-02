import type { IAiUsage, TAiSource, TAiUnavailableReason } from '@ibm-talent-bridge/shared-types';

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
  /** Ids de archivos ya subidos al proveedor (ICA `files`). */
  readonly fileIds?: readonly string[];
}

/** Archivo en memoria que se sube al proveedor. Nunca se escribe en disco. */
export interface IAiFileUpload {
  readonly filename: string;
  /** Se fija explícito: ICA no lo infiere de la extensión. */
  readonly mimeType: string;
  readonly data: Uint8Array;
}

/** Resultado de una consulta basada en archivo. El coordinator nunca lanza. */
export type TAiFileAskResult =
  | { readonly ok: true; readonly answer: string; readonly source: TAiSource; readonly model: string }
  | { readonly ok: false; readonly reason: TAiUnavailableReason };

export interface IAiCompletion {
  readonly content: string;
  readonly finishReason: string;
  readonly model: string;
  readonly usage?: IAiUsage;
}

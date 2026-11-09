import type { TAiTopic } from '@ibm-talent-bridge/shared-types';
import type { IAiFileUpload } from './ai-completion.interface';

export interface IAiOutputSchema {
  /** `null` si el valor es válido; si no, el motivo (se usa en la reparación). */
  validate(value: unknown): string | null;
}

export interface IAiTopicDefinition {
  readonly systemPrompt: string;
  readonly jsonMode?: boolean;
  readonly outputSchema?: IAiOutputSchema;
}

export interface IAiAskInput {
  readonly topic: TAiTopic;
  readonly query: string;
  /** Datos que aporta otra capability; se delimitan aparte de la consulta. */
  readonly context?: string;
}

/** Consulta sobre un archivo subido: el llamador aporta su propia definición (prompt + esquema). */
export interface IAiFileAskInput {
  readonly file: IAiFileUpload;
  readonly definition: IAiTopicDefinition;
  readonly query: string;
}

/** Consulta de texto con definición propia (sin tópico registrado ni archivo): el llamador aporta prompt y esquema. */
export interface IAiDefinitionAskInput {
  readonly definition: IAiTopicDefinition;
  readonly query: string;
  /** Tope TOTAL de la consulta (llamada + reparación); sustituye a `totalTimeoutMs` de la config. */
  readonly timeoutMs?: number;
}

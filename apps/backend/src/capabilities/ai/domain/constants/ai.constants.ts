/** Longitud máxima de `query` en `POST /ai/ask` (acota el proxy abierto, ADR-014). */
export const AI_QUERY_MAX_LENGTH = 4000;

/** Throttle de `POST /ai/ask`: más estricto que el global (THROTTLE_LIMIT, 100/min). */
export const AI_ASK_THROTTLE_LIMIT = 10;
export const AI_ASK_THROTTLE_TTL_MS = 60_000;

/** Modelo que reporta el proveedor `fake` (no existe en ICA). */
export const FAKE_MODEL_ID = 'fake-model';

export const AI_CONFIG = Symbol('AI_CONFIG');
export const AI_TOPICS_REGISTRY = Symbol('AI_TOPICS_REGISTRY');

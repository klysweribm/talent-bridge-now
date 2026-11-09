import { HttpError } from '@shared/infrastructure/httpError';
import { OpportunityDraftFailure } from './opportunityDraft.errors';

const SERVER_CODES = ['AI_UNAVAILABLE', 'AI_TIMEOUT', 'OPPORTUNITY_TEXT_TOO_LONG', 'OPPORTUNITY_SOURCE_UNREADABLE'] as const;
type TServerCode = typeof SERVER_CODES[number];
const NETWORK_STATUS = 0;

function serverCode(body: unknown): TServerCode | undefined {
  if (typeof body !== 'object' || body === null) return undefined;
  const { code } = body as { code?: unknown };
  return SERVER_CODES.find(known => known === code);
}

/** Ramifica por `body.code`, nunca por el status HTTP. Sin código conocido: fallo genérico (o de red). */
export function translateOpportunityDraftError(error: unknown): unknown {
  if (!(error instanceof HttpError)) return error;
  const code = serverCode(error.body);
  if (code === 'OPPORTUNITY_TEXT_TOO_LONG') return new OpportunityDraftFailure(code, (error.body as { message?: string }).message);
  if (code) return new OpportunityDraftFailure(code);
  return new OpportunityDraftFailure(error.status === NETWORK_STATUS ? 'NETWORK' : 'UNKNOWN');
}

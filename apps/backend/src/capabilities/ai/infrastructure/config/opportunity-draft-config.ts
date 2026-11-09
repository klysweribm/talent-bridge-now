import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import {
  OPPORTUNITY_DRAFT_DEFAULT_MAX_TEXT_CHARS,
  OPPORTUNITY_DRAFT_DEFAULT_TIMEOUT_MS,
  OPPORTUNITY_DRAFT_MAX_TEXT_ENV,
  OPPORTUNITY_DRAFT_TIMEOUT_ENV,
} from '../../domain/opportunity-draft/opportunity-draft.constants';
import type { TOpportunityDraftConfig } from '../../domain/interfaces/opportunity-draft-config.interface';

const logger = new Logger('OpportunityDraftConfig');

/** Ausente o vacía -> default; inválida -> default + aviso que dice QUÉ variable falla, nunca su valor. */
function positiveIntegerOrDefault(config: Pick<ConfigService, 'get'>, name: string, fallback: number): number {
  const raw = config.get<string>(name);
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (Number.isInteger(value) && value > 0) return value;
  logger.warn(`${name} is not a positive integer: using the default`);
  return fallback;
}

/** El tope y el timeout siempre existen; cada variable se evalúa por separado. */
export function buildOpportunityDraftConfig(config: Pick<ConfigService, 'get'>): TOpportunityDraftConfig {
  return {
    maxTextChars: positiveIntegerOrDefault(config, OPPORTUNITY_DRAFT_MAX_TEXT_ENV, OPPORTUNITY_DRAFT_DEFAULT_MAX_TEXT_CHARS),
    timeoutMs: positiveIntegerOrDefault(config, OPPORTUNITY_DRAFT_TIMEOUT_ENV, OPPORTUNITY_DRAFT_DEFAULT_TIMEOUT_MS),
  };
}

import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { OPPORTUNITY_DRAFT_MAX_TEXT_ENV, OPPORTUNITY_DRAFT_TIMEOUT_ENV } from '../../domain/opportunity-draft/opportunity-draft.constants';
import type { TOpportunityDraftConfig } from '../../domain/interfaces/opportunity-draft-config.interface';

const logger = new Logger('OpportunityDraftConfig');

const positiveInteger = (config: Pick<ConfigService, 'get'>, name: string): number | undefined => {
  const value = Number(config.get<string>(name));
  return Number.isInteger(value) && value > 0 ? value : undefined;
};

/**
 * Falla CERRADO: sin tope o sin timeout válidos el borrador queda apagado (la app arranca igual y el endpoint
 * responde `AI_UNAVAILABLE`). Los logs dicen QUÉ variable falla, nunca su valor. No hay valores por defecto en el código.
 */
export function buildOpportunityDraftConfig(config: Pick<ConfigService, 'get'>): TOpportunityDraftConfig {
  const maxTextChars = positiveInteger(config, OPPORTUNITY_DRAFT_MAX_TEXT_ENV);
  const timeoutMs = positiveInteger(config, OPPORTUNITY_DRAFT_TIMEOUT_ENV);
  if (maxTextChars === undefined) return disabled(OPPORTUNITY_DRAFT_MAX_TEXT_ENV);
  if (timeoutMs === undefined) return disabled(OPPORTUNITY_DRAFT_TIMEOUT_ENV);
  return { enabled: true, maxTextChars, timeoutMs };
}

function disabled(name: string): TOpportunityDraftConfig {
  logger.warn(`Opportunity draft disabled: ${name} is missing or not a positive integer`);
  return { enabled: false };
}

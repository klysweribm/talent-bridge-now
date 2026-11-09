import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { OPPORTUNITY_SOURCE_DEFAULT_MAX_FILE_BYTES, OPPORTUNITY_SOURCE_MAX_FILE_ENV } from '../../domain/opportunity-draft/opportunity-draft.constants';
import type { TOpportunitySourceConfig } from '../../domain/interfaces/opportunity-source.interface';

const logger = new Logger('OpportunitySourceConfig');

/**
 * El tope del archivo siempre existe: variable ausente -> valor por defecto; inválida -> valor por defecto + aviso que dice
 * QUÉ variable falla, nunca su valor.
 */
export function buildOpportunitySourceConfig(config: Pick<ConfigService, 'get'>): TOpportunitySourceConfig {
  const raw = config.get<string>(OPPORTUNITY_SOURCE_MAX_FILE_ENV);
  if (raw === undefined || raw === '') return { maxFileBytes: OPPORTUNITY_SOURCE_DEFAULT_MAX_FILE_BYTES };
  const value = Number(raw);
  if (Number.isInteger(value) && value > 0) return { maxFileBytes: value };
  logger.warn(`${OPPORTUNITY_SOURCE_MAX_FILE_ENV} is not a positive integer: using the default`);
  return { maxFileBytes: OPPORTUNITY_SOURCE_DEFAULT_MAX_FILE_BYTES };
}

import { HttpException } from '@nestjs/common';
import { OpportunityDraftError } from '../../domain/errors/opportunity-draft.error';
import { OPPORTUNITY_DRAFT_HTTP_STATUS } from '../../domain/opportunity-draft/opportunity-draft.constants';

/**
 * Error del borrador -> `HttpException` con cuerpo `{ code, message }`. 503/504 y nunca 401: el httpClient del
 * frontend cierra la sesión ante un 401. Lo que no es un error del borrador pasa intacto.
 */
export function toOpportunityDraftHttpError(error: unknown): unknown {
  return error instanceof OpportunityDraftError
    ? new HttpException({ code: error.code, message: error.message }, OPPORTUNITY_DRAFT_HTTP_STATUS[error.code])
    : error;
}

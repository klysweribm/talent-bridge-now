import { z } from 'zod';
import { PROCESS_DATA_ERRORS } from '../config/processCreate.constants';
import type { IOpportunityLimits } from '@ibm-talent-bridge/shared-types';
import { buildOpportunityShape, type TOpportunityShape } from './opportunity.schema';
import { text } from './textField.schema';

type TProcessEditSchema = z.ZodObject<{ title: z.ZodString; clientName: z.ZodString } & TOpportunityShape>;

/** Edición del detalle: título, cliente y campos de la oportunidad; mismos límites y mensajes que la creación. */
export function buildProcessEditSchema(limits: IOpportunityLimits): TProcessEditSchema {
  return z.object({
    title:      text(PROCESS_DATA_ERRORS.titleRequired, PROCESS_DATA_ERRORS.titleTooLong),
    clientName: text(PROCESS_DATA_ERRORS.clientRequired, PROCESS_DATA_ERRORS.clientTooLong),
    ...buildOpportunityShape(limits),
  });
}

export type TProcessEditValues = z.infer<ReturnType<typeof buildProcessEditSchema>>;

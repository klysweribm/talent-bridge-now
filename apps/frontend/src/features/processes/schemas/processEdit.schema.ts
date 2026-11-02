import { z } from 'zod';
import { PROCESS_DATA_ERRORS } from '../config/processCreate.constants';
import { opportunityShape } from './opportunity.schema';
import { text } from './textField.schema';

/** Edición del detalle: título, cliente y campos de la oportunidad; mismos límites y mensajes que la creación. */
export const processEditSchema = z.object({
  title:      text(PROCESS_DATA_ERRORS.titleRequired, PROCESS_DATA_ERRORS.titleTooLong),
  clientName: text(PROCESS_DATA_ERRORS.clientRequired, PROCESS_DATA_ERRORS.clientTooLong),
  ...opportunityShape,
});

export type TProcessEditValues = z.infer<typeof processEditSchema>;

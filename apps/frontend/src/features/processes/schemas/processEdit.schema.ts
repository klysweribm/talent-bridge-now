import { z } from 'zod';
import { PROCESS_DATA_ERRORS } from '../config/processCreate.constants';
import { text } from './processData.schema';

/** Edición de título y cliente del detalle; mismos límites y mensajes que el formulario de creación. */
export const processEditSchema = z.object({
  title:      text(PROCESS_DATA_ERRORS.titleRequired, PROCESS_DATA_ERRORS.titleTooLong),
  clientName: text(PROCESS_DATA_ERRORS.clientRequired, PROCESS_DATA_ERRORS.clientTooLong),
});

export type TProcessEditValues = z.infer<typeof processEditSchema>;

import { z } from 'zod';
import { PROCESS_DATA_ERRORS } from '../config/processCreate.constants';
import type { TProcessCreatorRole } from '../types/processCreate.types';
import { opportunityShape } from './opportunity.schema';
import { text } from './textField.schema';

type TProcessDataSchema = z.ZodObject<{
  title: z.ZodString; clientName: z.ZodString; ownerPmId: z.ZodString | z.ZodOptional<z.ZodString>; recruiterId: z.ZodOptional<z.ZodString>;
} & typeof opportunityShape>;

/** Esquema del paso 1 según quién crea: solo el reclutador debe elegir el PM responsable. */
export function buildProcessDataSchema(role: TProcessCreatorRole): TProcessDataSchema {
  return z.object({
    title:       text(PROCESS_DATA_ERRORS.titleRequired, PROCESS_DATA_ERRORS.titleTooLong),
    clientName:  text(PROCESS_DATA_ERRORS.clientRequired, PROCESS_DATA_ERRORS.clientTooLong),
    ownerPmId:   role === 'recruiter'
      ? z.string({ required_error: PROCESS_DATA_ERRORS.ownerPmRequired }).min(1, PROCESS_DATA_ERRORS.ownerPmRequired)
      : z.string().optional(),
    recruiterId: z.string().optional(),
    ...opportunityShape,
  });
}

export type TProcessDataValues = z.infer<ReturnType<typeof buildProcessDataSchema>>;

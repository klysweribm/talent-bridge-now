import { z } from 'zod';
import { PROCESS_TEXT_MAX_LENGTH } from '../config/processCreate.constants';

/** Texto recortado, obligatorio y con tope de largo (por defecto el de título y cliente). */
export const text = (required: string, tooLong: string, max: number = PROCESS_TEXT_MAX_LENGTH): z.ZodString =>
  z.string({ required_error: required }).trim().min(1, required).max(max, tooLong);

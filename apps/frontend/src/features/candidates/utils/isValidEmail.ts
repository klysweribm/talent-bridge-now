import { z } from 'zod';

const EMAIL_SCHEMA = z.string().trim().email();

/** Mismo criterio que el esquema del formulario (zod), para el indicador de formato válido. */
export function isValidEmail(value: string | undefined): boolean {
  return EMAIL_SCHEMA.safeParse(value ?? '').success;
}

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import type { ICandidateProfileDraft } from '@ibm-talent-bridge/shared-types';
import { SENIORITY_VALUES } from '@features/bench/config/bench.constants';
import { draftToFormValues, EMPTY_FORM_VALUES, type ICandidateFormValues } from '../utils/draftMapping';

export const candidateSchema = z.object({
  fullName: z.string().trim().min(1, 'El nombre es obligatorio.'),
  email: z.string().trim().min(1, 'El correo es obligatorio.').email('Ingresa un correo válido.'),
  phone: z.string(),
  linkedIn: z.string(),
  country: z.string(),
  city: z.string(),
  primaryRole: z.string(),
  seniority: z.enum(['', ...SENIORITY_VALUES]),
  yearsExperience: z.string().regex(/^\d{0,2}$/, 'Ingresa un número entero entre 0 y 99.'),
  skills: z.string(),
  summary: z.string(),
}) satisfies z.ZodType<ICandidateFormValues>;

/**
 * El borrador solo siembra los valores iniciales; después manda el estado del formulario. Si el perfil ya existe
 * (`lockedEmail`), el correo sembrado es el guardado, no el que trajo el CV: es el que identifica al perfil.
 */
export function useCandidateForm(draft?: ICandidateProfileDraft, lockedEmail?: string): UseFormReturn<ICandidateFormValues> {
  const seeded = draft ? draftToFormValues(draft) : EMPTY_FORM_VALUES;
  return useForm<ICandidateFormValues>({
    resolver: zodResolver(candidateSchema),
    defaultValues: lockedEmail === undefined ? seeded : { ...seeded, email: lockedEmail },
  });
}

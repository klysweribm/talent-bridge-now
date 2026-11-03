import { z } from 'zod';
import { OPPORTUNITY_ERRORS, OPPORTUNITY_LIMITS } from '../config/processOpportunity.constants';
import { text } from './textField.schema';

const normalize = (skill: string): string => skill.toLocaleLowerCase();

const skills = z.array(z.string().trim(), { required_error: OPPORTUNITY_ERRORS.skillsRequired }).superRefine((list, ctx) => {
  const add = (message: string): void => ctx.addIssue({ code: z.ZodIssueCode.custom, message });
  if (list.length < OPPORTUNITY_LIMITS.skillsMin) add(OPPORTUNITY_ERRORS.skillsRequired);
  if (list.length > OPPORTUNITY_LIMITS.skillsMax) add(OPPORTUNITY_ERRORS.skillsTooMany);
  if (list.some(skill => skill.length > OPPORTUNITY_LIMITS.skillMax)) add(OPPORTUNITY_ERRORS.skillTooLong);
  if (new Set(list.map(normalize)).size !== list.length) add(OPPORTUNITY_ERRORS.skillsDuplicated);
});

/** Campos de la oportunidad (PROC-1c), compartidos por el paso 1 de creación y la edición del detalle. */
export const opportunityShape = {
  opportunityRole: text(OPPORTUNITY_ERRORS.roleRequired, OPPORTUNITY_ERRORS.roleTooLong, OPPORTUNITY_LIMITS.roleMax),
  skills,
  roleDescription: text(OPPORTUNITY_ERRORS.descriptionRequired, OPPORTUNITY_ERRORS.descriptionTooLong, OPPORTUNITY_LIMITS.descriptionMax),
  band: z.number({ required_error: OPPORTUNITY_ERRORS.bandRequired, invalid_type_error: OPPORTUNITY_ERRORS.bandInvalid })
    .int(OPPORTUNITY_ERRORS.bandInvalid)
    .min(OPPORTUNITY_LIMITS.bandMin, OPPORTUNITY_ERRORS.bandInvalid)
    .max(OPPORTUNITY_LIMITS.bandMax, OPPORTUNITY_ERRORS.bandInvalid),
};

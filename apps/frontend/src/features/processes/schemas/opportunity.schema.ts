import { z } from 'zod';
import type { IOpportunityLimits } from '@ibm-talent-bridge/shared-types';
import { buildOpportunityErrors } from '../config/processOpportunity.constants';
import { text } from './textField.schema';

export type TOpportunityShape = {
  readonly opportunityRole: z.ZodString;
  readonly skills:          z.ZodEffects<z.ZodArray<z.ZodString>>;
  readonly roleDescription: z.ZodString;
  readonly band:            z.ZodNumber;
};

const normalize = (skill: string): string => skill.toLocaleLowerCase();

/** Campos de la oportunidad (PROC-1c), compartidos por el paso 1 de creación y la edición del detalle. */
export function buildOpportunityShape(limits: IOpportunityLimits): TOpportunityShape {
  const errors = buildOpportunityErrors(limits);
  const skills = z.array(z.string().trim(), { required_error: errors.skillsRequired }).superRefine((list, ctx) => {
    const add = (message: string): void => ctx.addIssue({ code: z.ZodIssueCode.custom, message });
    if (list.length < limits.skillsMin) add(errors.skillsRequired);
    if (list.length > limits.skillsMax) add(errors.skillsTooMany);
    if (list.some(skill => skill.length > limits.skillMax)) add(errors.skillTooLong);
    if (new Set(list.map(normalize)).size !== list.length) add(errors.skillsDuplicated);
  });
  return {
    opportunityRole: text(errors.roleRequired, errors.roleTooLong, limits.roleMax),
    skills,
    roleDescription: text(errors.descriptionRequired, errors.descriptionTooLong, limits.descriptionMax),
    band: z.number({ required_error: errors.bandRequired, invalid_type_error: errors.bandInvalid })
      .int(errors.bandInvalid)
      .min(limits.bandMin, errors.bandInvalid)
      .max(limits.bandMax, errors.bandInvalid),
  };
}


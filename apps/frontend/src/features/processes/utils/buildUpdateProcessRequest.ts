import type { IUpdateProcessRequest } from '@ibm-talent-bridge/shared-types';
import type { TProcessEditValues } from '../schemas/processEdit.schema';

const sameList = (a: readonly string[], b: readonly string[]): boolean => a.length === b.length && a.every((item, index) => item === b[index]);

/** PATCH parcial: solo los campos cuyo valor (ya validado) difiere del proceso actual. */
type TCurrent = Omit<TProcessEditValues, 'band' | 'skills'> & { readonly band: number | undefined; readonly skills: readonly string[] };

export function buildUpdateProcessRequest(current: TCurrent, next: TProcessEditValues): IUpdateProcessRequest {
  return {
    ...(next.title !== current.title ? { title: next.title } : {}),
    ...(next.clientName !== current.clientName ? { clientName: next.clientName } : {}),
    ...(next.opportunityRole !== current.opportunityRole ? { opportunityRole: next.opportunityRole } : {}),
    ...(!sameList(next.skills, current.skills) ? { skills: next.skills } : {}),
    ...(next.roleDescription !== current.roleDescription ? { roleDescription: next.roleDescription } : {}),
    ...(next.band !== current.band ? { band: next.band } : {}),
  };
}

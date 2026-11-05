import type { ICreateProcessRequest, IProcessCandidateSummary } from '@ibm-talent-bridge/shared-types';
import type { IProcessDataDraft, TProcessCreatorRole } from '../types/processCreate.types';

interface IWizardSnapshot {
  readonly data:       IProcessDataDraft;
  readonly candidates: readonly IProcessCandidateSummary[];
}

/** Arma el body de `POST /processes`: el reclutador manda ownerPmId; el PM, recruiterId solo si lo eligió. */
export function buildCreateProcessRequest({ data, candidates }: IWizardSnapshot, role: TProcessCreatorRole): ICreateProcessRequest {
  if (data.band === undefined) throw new Error('La banda es obligatoria para crear la oportunidad.');
  return {
    title:           data.title,
    clientName:      data.clientName,
    opportunityRole: data.opportunityRole,
    skills:          data.skills,
    roleDescription: data.roleDescription,
    band:            data.band,
    ...(role === 'recruiter' ? { ownerPmId: data.ownerPmId } : data.recruiterId ? { recruiterId: data.recruiterId } : {}),
    ...(candidates.length > 0 ? { candidateIds: candidates.map(candidate => candidate.id) } : {}),
  };
}

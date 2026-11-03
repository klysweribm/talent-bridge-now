import type { ICandidateActor } from '@ibm-talent-bridge/shared-types';
import { ProcessCandidateClaimService } from '../application/services/process-candidate-claim.service';
import { ProcessDetailService } from '../application/services/process-detail.service';
import { ProcessService } from '../application/services/process.service';
import { buildProcessFakes, PM_ID, REC_ID, type IProcessFakes } from './process-fakes';
import { buildUsersFake } from './process-users.fake';

export const pmActor: ICandidateActor = { id: PM_ID, email: 'pm@example.test', role: 'pm' };
export const recActor: ICandidateActor = { id: REC_ID, email: 'rec@example.test', role: 'recruiter' };

export function build(): { service: ProcessService; create: jest.Mock; fakes: IProcessFakes } {
  const fakes = buildProcessFakes();
  const users = buildUsersFake().service;
  const config = { maxCandidatesPerProcess: 5 };
  const claims = new ProcessCandidateClaimService(fakes.repository, fakes.directory, config);
  const service = new ProcessService(fakes.repository, users, config, claims, new ProcessDetailService(fakes.directory, users, config));
  return { service, create: fakes.spies.create, fakes };
}

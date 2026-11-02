import type { ICandidateActor, UserRole } from '@ibm-talent-bridge/shared-types';
import type { UserDirectoryService } from '../../auth/application/services/user-directory.service';
import { ProcessCandidateClaimService } from '../application/services/process-candidate-claim.service';
import { ProcessDetailService } from '../application/services/process-detail.service';
import { ProcessService } from '../application/services/process.service';
import { buildProcessFakes, OTHER_PM, OTHER_REC, PM_ID, REC_ID, type IProcessFakes } from './process-fakes';

const ROLES: Record<string, UserRole> = { [PM_ID]: 'pm', [OTHER_PM]: 'pm', [REC_ID]: 'recruiter', [OTHER_REC]: 'recruiter', 'tech-1': 'technical_ref' };
export const pmActor: ICandidateActor = { id: PM_ID, email: 'pm@example.test', role: 'pm' };
export const recActor: ICandidateActor = { id: REC_ID, email: 'rec@example.test', role: 'recruiter' };

export function build(): { service: ProcessService; create: jest.Mock; fakes: IProcessFakes } {
  const fakes = buildProcessFakes();
  const users = { findRole: (id: string) => Promise.resolve(ROLES[id] ?? null) } as unknown as UserDirectoryService;
  const config = { maxCandidatesPerProcess: 5 };
  const claims = new ProcessCandidateClaimService(fakes.repository, fakes.directory, config);
  const service = new ProcessService(fakes.repository, users, config, claims, new ProcessDetailService(fakes.directory, config));
  return { service, create: fakes.spies.create, fakes };
}

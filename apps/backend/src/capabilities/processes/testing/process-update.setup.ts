import type { ICandidateActor, UserRole } from '@ibm-talent-bridge/shared-types';
import type { UserDirectoryService } from '../../auth/application/services/user-directory.service';
import { ProcessDetailService } from '../application/services/process-detail.service';
import { ProcessUpdateService } from '../application/services/process-update.service';
import { buildProcessFakes, OTHER_PM, OTHER_REC, PM_ID, REC_ID, type IProcessFakes } from './process-fakes';

const ROLES: Record<string, UserRole> = { [PM_ID]: 'pm', [OTHER_PM]: 'pm', [REC_ID]: 'recruiter', [OTHER_REC]: 'recruiter', 'tech-1': 'technical_ref' };
export const actorOf = (id: string, role: UserRole): ICandidateActor => ({ id, email: `${id}@example.test`, role });
export const ownerPm = actorOf(PM_ID, 'pm');
export const assignedRec = actorOf(REC_ID, 'recruiter');

export function setupUpdate(): { fakes: IProcessFakes; service: ProcessUpdateService } {
  const fakes = buildProcessFakes();
  fakes.addProcess();
  const users = { findRole: (id: string) => Promise.resolve(ROLES[id] ?? null) } as unknown as UserDirectoryService;
  const config = { maxCandidatesPerProcess: 5 };
  return { fakes, service: new ProcessUpdateService(fakes.repository, fakes.directory, users, new ProcessDetailService(fakes.directory, config)) };
}

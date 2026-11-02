import type { ICandidateActor, UserRole } from '@ibm-talent-bridge/shared-types';
import { ProcessDetailService } from '../application/services/process-detail.service';
import { ProcessUpdateService } from '../application/services/process-update.service';
import { buildProcessFakes, PM_ID, REC_ID, type IProcessFakes } from './process-fakes';
import { buildUsersFake, type IUsersFake } from './process-users.fake';

export const actorOf = (id: string, role: UserRole): ICandidateActor => ({ id, email: `${id}@example.test`, role });
export const ownerPm = actorOf(PM_ID, 'pm');
export const assignedRec = actorOf(REC_ID, 'recruiter');

export function setupUpdate(): { fakes: IProcessFakes; users: IUsersFake; service: ProcessUpdateService } {
  const fakes = buildProcessFakes();
  fakes.addProcess();
  const users = buildUsersFake();
  const config = { maxCandidatesPerProcess: 5 };
  return { fakes, users, service: new ProcessUpdateService(fakes.repository, fakes.directory, users.service, new ProcessDetailService(fakes.directory, users.service, config)) };
}

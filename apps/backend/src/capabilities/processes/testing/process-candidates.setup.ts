import type { ICandidateActor } from '@ibm-talent-bridge/shared-types';
import { ProcessCandidatesService } from '../application/services/process-candidates.service';
import { ProcessDetailService } from '../application/services/process-detail.service';
import { buildProcessFakes, REC_ID, PM_ID, type IProcessFakes } from './process-fakes';

export const MAX = 3;
const CONFIG = { maxCandidatesPerProcess: MAX };
export const actorOf = (id: string, role: ICandidateActor['role']): ICandidateActor => ({ id, email: `${id}@example.test`, role });
export const owner = actorOf(PM_ID, 'pm');
export const assigned = actorOf(REC_ID, 'recruiter');

export function setup(): { fakes: IProcessFakes; service: ProcessCandidatesService } {
  const fakes = buildProcessFakes();
  fakes.addProcess();
  fakes.addCandidate('c-1');
  return { fakes, service: new ProcessCandidatesService(fakes.repository, fakes.directory, CONFIG, new ProcessDetailService(fakes.directory, CONFIG)) };
}

export const loggedText = (spy: jest.SpyInstance): string => JSON.stringify(spy.mock.calls);


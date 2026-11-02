import type { UserDirectoryService } from '../../../auth/application/services/user-directory.service';
import { buildProcessFakes } from '../../testing/process-fakes';
import { ProcessCandidateClaimService } from './process-candidate-claim.service';
import { ProcessDetailService } from './process-detail.service';
import { ProcessService } from './process.service';

function buildWith(maxCandidatesPerProcess: number): ProcessService {
  const fakes = buildProcessFakes();
  const config = { maxCandidatesPerProcess };
  const claims = new ProcessCandidateClaimService(fakes.repository, fakes.directory, config);
  return new ProcessService(fakes.repository, {} as UserDirectoryService, config, claims, new ProcessDetailService(fakes.directory, {} as UserDirectoryService, config));
}

describe('ProcessService.getLimits', () => {
  it.each([5, 7])('should return the configured maxCandidates %i', (max) => {
    expect(buildWith(max).getLimits()).toEqual({ maxCandidates: max });
  });
});

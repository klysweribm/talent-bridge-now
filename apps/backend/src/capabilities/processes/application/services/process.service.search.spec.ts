import { ProcessService } from './process.service';
import { ProcessCandidateClaimService } from './process-candidate-claim.service';
import { ProcessDetailService } from './process-detail.service';
import { buildProcessFakes, type IProcessFakes } from '../../testing/process-fakes';
import { buildUsersFake } from '../../testing/process-users.fake';

function build(): { service: ProcessService; fakes: IProcessFakes } {
  const fakes = buildProcessFakes();
  const users = buildUsersFake().service;
  const config = { maxCandidatesPerProcess: 5 };
  const claims = new ProcessCandidateClaimService(fakes.repository, fakes.directory, config);
  return { service: new ProcessService(fakes.repository, users, config, claims, new ProcessDetailService(fakes.directory, users, config)), fakes };
}

describe('ProcessService.list search', () => {
  it('should pass q to findPaginated and count, and reflect the filtered total', async () => {
    const { service, fakes } = build();
    fakes.addProcess({ id: 'p-1', title: 'Alpha' });
    fakes.addProcess({ id: 'p-2', title: 'Beta' });
    const page = await service.list(1, 1, 'alp');
    expect(fakes.spies.findPaginated).toHaveBeenCalledWith(1, 1, 'alp');
    expect(fakes.spies.count).toHaveBeenCalledWith('alp');
    expect(page).toMatchObject({ total: 1, totalPages: 1 });
    expect(page.data.map((i) => i.id)).toEqual(['p-1']);
  });

  it('should behave as before when q is undefined', async () => {
    const { service, fakes } = build();
    fakes.addProcess({ id: 'p-1' });
    expect(await service.list(1, 20)).toMatchObject({ total: 1 });
    expect(fakes.spies.findPaginated).toHaveBeenCalledWith(1, 20, undefined);
  });
});

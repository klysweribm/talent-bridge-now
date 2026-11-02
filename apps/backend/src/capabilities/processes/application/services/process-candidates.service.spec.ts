import { ForbiddenException, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { FULL_NAME, OTHER_REC } from '../../testing/process-fakes';
import { actorOf, assigned, loggedText, owner, setup } from '../../testing/process-candidates.setup';

describe('ProcessCandidatesService.dissociate', () => {
  afterEach(() => jest.restoreAllMocks());

  it('should remove the candidate from the process and free it', async () => {
    const { fakes, service } = setup();
    await service.associate('p-0', 'c-1', owner);
    const detail = await service.dissociate('p-0', 'c-1', assigned);
    expect(detail).toMatchObject({ candidateIds: [], candidates: [] });
    expect(fakes.candidates.get('c-1')?.processId).toBeUndefined();
  });

  it('should throw 404 when the candidate is not in the process', async () => {
    const { service } = setup();
    await expect(service.dissociate('p-0', 'c-1', owner)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should throw 403 for a foreign recruiter', async () => {
    const { fakes, service } = setup();
    await service.associate('p-0', 'c-1', owner);
    await expect(service.dissociate('p-0', 'c-1', actorOf(OTHER_REC, 'recruiter'))).rejects.toBeInstanceOf(ForbiddenException);
    expect(fakes.processes.get('p-0')?.candidateIds).toEqual(['c-1']);
  });

  it('should put the candidate back, log ids only and throw 503 when freeing fails', async () => {
    const { fakes, service } = setup();
    await service.associate('p-0', 'c-1', owner);
    const error = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    fakes.spies.release.mockRejectedValue(new Error('mongo down'));
    await expect(service.dissociate('p-0', 'c-1', owner)).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(fakes.processes.get('p-0')?.candidateIds).toEqual(['c-1']);
    expect(loggedText(error)).toContain('c-1');
    expect(loggedText(error)).not.toContain(FULL_NAME);
  });
});

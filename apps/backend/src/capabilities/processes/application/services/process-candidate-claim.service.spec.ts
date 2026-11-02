import { BadRequestException, ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { buildProcessFakes } from '../../testing/process-fakes';
import { ProcessCandidateClaimService } from './process-candidate-claim.service';

const setup = (max = 2): ReturnType<typeof buildProcessFakes> & { service: ProcessCandidateClaimService; findByIds: jest.Mock } => {
  const fakes = buildProcessFakes();
  const findByIds = jest.fn((ids: readonly string[]) => fakes.directory.findByIds(ids));
  const directory = { ...fakes.directory, findByIds };
  return { ...fakes, findByIds, service: new ProcessCandidateClaimService(fakes.repository, directory, { maxCandidatesPerProcess: max }) };
};

describe('ProcessCandidateClaimService.validate', () => {
  it('should do nothing for an empty list', async () => {
    const s = setup();
    await s.service.validate([]);
    expect(s.findByIds).not.toHaveBeenCalled();
  });

  it('should throw 400 PROCESS_CANDIDATE_LIMIT before querying the directory', async () => {
    const s = setup(2);
    const error: unknown = await s.service.validate(['a', 'b', 'c']).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(BadRequestException);
    expect((error as BadRequestException).getResponse()).toMatchObject({ code: 'PROCESS_CANDIDATE_LIMIT' });
    expect(s.findByIds).not.toHaveBeenCalled();
  });

  it('should throw 400 for duplicated ids and 404 when one is missing', async () => {
    const s = setup();
    s.addCandidate('a');
    await expect(s.service.validate(['a', 'a'])).rejects.toBeInstanceOf(BadRequestException);
    await expect(s.service.validate(['a', 'ghost'])).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should throw 409 CANDIDATE_ALREADY_ASSIGNED when a candidate already has a process', async () => {
    const s = setup();
    s.addCandidate('a', 'other-process');
    const error: unknown = await s.service.validate(['a']).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ConflictException);
    expect((error as ConflictException).getResponse()).toMatchObject({ statusCode: 409, code: 'CANDIDATE_ALREADY_ASSIGNED' });
  });
});

describe('ProcessCandidateClaimService.claim', () => {
  it('should throw 409 CANDIDATE_ALREADY_ASSIGNED, release what it marked and delete the process', async () => {
    const s = setup();
    s.addProcess({ id: 'p-9' });
    s.addCandidate('a');
    s.addCandidate('b', 'other-process');
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    const error: unknown = await s.service.claim('p-9', ['a', 'b']).catch((e: unknown) => e);
    expect((error as ConflictException).getResponse()).toMatchObject({ code: 'CANDIDATE_ALREADY_ASSIGNED' });
    expect(s.candidates.get('a')?.processId).toBeUndefined();
    expect(s.candidates.get('b')?.processId).toBe('other-process');
    expect(s.processes.has('p-9')).toBe(false);
    jest.restoreAllMocks();
  });
});

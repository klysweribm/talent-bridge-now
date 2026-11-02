import { BadRequestException, ConflictException, ForbiddenException, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { FULL_NAME, OTHER_PM, OTHER_REC, REC_ID } from '../../testing/process-fakes';
import { actorOf, assigned, loggedText, MAX, owner, setup } from '../../testing/process-candidates.setup';

describe('ProcessCandidatesService.associate authorization', () => {
  afterEach(() => jest.restoreAllMocks());

  it('should mark the candidate and list it in the process when the owner PM associates', async () => {
    const { fakes, service } = setup();
    const detail = await service.associate('p-0', 'c-1', owner);
    expect(fakes.candidates.get('c-1')?.processId).toBe('p-0');
    expect(detail).toMatchObject({ candidateIds: ['c-1'], candidates: [{ id: 'c-1', fullName: FULL_NAME }], maxCandidates: MAX });
  });

  it('should allow the process recruiter', async () => {
    const { fakes, service } = setup();
    await service.associate('p-0', 'c-1', assigned);
    expect(fakes.processes.get('p-0')?.candidateIds).toEqual(['c-1']);
  });

  it.each([
    ['a recruiter who is not the process recruiter', actorOf(OTHER_REC, 'recruiter'), REC_ID],
    ['a PM who is not the owner', actorOf(OTHER_PM, 'pm'), REC_ID],
    ['any recruiter when the process has no recruiter', actorOf(OTHER_REC, 'recruiter'), null],
  ])('should throw 403 for %s without touching anything', async (_label, actor, recruiterId) => {
    const { fakes, service } = setup();
    fakes.addProcess({ recruiterId });
    await expect(service.associate('p-0', 'c-1', actor)).rejects.toBeInstanceOf(ForbiddenException);
    expect(fakes.spies.assign).not.toHaveBeenCalled();
    expect(fakes.spies.addCandidate).not.toHaveBeenCalled();
  });

  it('should let only the owner PM manage a process without recruiter', async () => {
    const { fakes, service } = setup();
    fakes.addProcess({ recruiterId: null });
    await expect(service.associate('p-0', 'c-1', owner)).resolves.toMatchObject({ candidateIds: ['c-1'] });
  });
});

describe('ProcessCandidatesService.associate limits and conflicts', () => {
  afterEach(() => jest.restoreAllMocks());

  it('should throw 404 for a missing process before checking authorization', async () => {
    const { service } = setup();
    await expect(service.associate('nope', 'c-1', actorOf(OTHER_REC, 'recruiter'))).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should throw 403 before 404 for a missing candidate when unauthorized', async () => {
    const { service } = setup();
    await expect(service.associate('p-0', 'ghost', actorOf(OTHER_REC, 'recruiter'))).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should throw 404 for a missing candidate', async () => {
    const { service } = setup();
    await expect(service.associate('p-0', 'ghost', owner)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should accept exactly the maximum and reject one more with 400 naming the limit', async () => {
    const { fakes, service } = setup();
    for (const id of ['c-2', 'c-3', 'c-4']) fakes.addCandidate(id);
    await service.associate('p-0', 'c-1', owner);
    await service.associate('p-0', 'c-2', owner);
    await expect(service.associate('p-0', 'c-3', owner)).resolves.toMatchObject({ candidateIds: ['c-1', 'c-2', 'c-3'] });
    const error = await service.associate('p-0', 'c-4', owner).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(BadRequestException);
    expect((error as BadRequestException).message).toContain(String(MAX));
    expect(fakes.candidates.get('c-4')?.processId).toBeUndefined();
  });
});

describe('ProcessCandidatesService.associate rollback', () => {
  afterEach(() => jest.restoreAllMocks());

  it('should throw 409 when the candidate belongs to another process', async () => {
    const { fakes, service } = setup();
    fakes.addCandidate('c-1', 'p-other');
    await expect(service.associate('p-0', 'c-1', owner)).rejects.toBeInstanceOf(ConflictException);
    expect(fakes.candidates.get('c-1')?.processId).toBe('p-other');
  });

  it('should throw 409 for a candidate already in the same process, keeping it linked', async () => {
    const { fakes, service } = setup();
    await service.associate('p-0', 'c-1', owner);
    await expect(service.associate('p-0', 'c-1', owner)).rejects.toBeInstanceOf(ConflictException);
    expect(fakes.processes.get('p-0')?.candidateIds).toEqual(['c-1']);
    expect(fakes.candidates.get('c-1')?.processId).toBe('p-0');
  });

  it('should release the candidate, log ids only and throw 503 when the second write fails', async () => {
    const { fakes, service } = setup();
    const error = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    fakes.spies.addCandidate.mockRejectedValue(new Error('mongo down'));
    await expect(service.associate('p-0', 'c-1', owner)).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(fakes.candidates.get('c-1')?.processId).toBeUndefined();
    expect(loggedText(error)).toContain('c-1');
    expect(loggedText(error)).not.toContain(FULL_NAME);
  });

  it('should release the candidate and answer 400 when the atomic limit check rejects the add', async () => {
    const { fakes, service } = setup();
    fakes.spies.addCandidate.mockResolvedValue(false);
    await expect(service.associate('p-0', 'c-1', owner)).rejects.toBeInstanceOf(BadRequestException);
    expect(fakes.candidates.get('c-1')?.processId).toBeUndefined();
  });

  it('should throw 409 when the candidate is taken between the read and the claim', async () => {
    const { fakes, service } = setup();
    fakes.spies.assign.mockResolvedValue('taken');
    await expect(service.associate('p-0', 'c-1', owner)).rejects.toBeInstanceOf(ConflictException);
    expect(fakes.spies.addCandidate).not.toHaveBeenCalled();
  });
});

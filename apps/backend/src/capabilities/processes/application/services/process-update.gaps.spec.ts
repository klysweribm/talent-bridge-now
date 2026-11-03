import { BadRequestException, ForbiddenException, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { actorOf, assignedRec, ownerPm, setupUpdate } from '../../testing/process-update.setup';
import { OTHER_PM, OTHER_REC } from '../../testing/process-fakes';

const withCandidates = (setup: ReturnType<typeof setupUpdate>, ids: readonly string[]): void => {
  setup.fakes.addProcess({ candidateIds: ids });
  ids.forEach((id) => setup.fakes.addCandidate(id, 'p-0'));
};

describe('ProcessUpdateService.update cancelling edge cases', () => {
  it('should cancel when a candidate was already released (idempotent)', async () => {
    const s = setupUpdate();
    withCandidates(s, ['c-1', 'c-2']);
    s.fakes.candidates.set('c-1', { id: 'c-1', fullName: 'N' });
    const detail = await s.service.update('p-0', { status: 'cancelled' }, ownerPm);
    expect(detail).toMatchObject({ status: 'cancelled', candidateIds: [] });
    expect(s.fakes.candidates.get('c-2')?.processId).toBeUndefined();
  });

  it('should keep the process intact when the second of several releases fails', async () => {
    const s = setupUpdate();
    withCandidates(s, ['c-1', 'c-2', 'c-3']);
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    s.fakes.spies.release.mockResolvedValueOnce(true).mockRejectedValueOnce(new Error('mongo down'));
    await expect(s.service.update('p-0', { status: 'cancelled' }, ownerPm)).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(s.fakes.processes.get('p-0')).toMatchObject({ status: 'open', candidateIds: ['c-1', 'c-2', 'c-3'] });
    expect(s.fakes.spies.release).toHaveBeenCalledTimes(2);
    jest.restoreAllMocks();
  });

  it('should release the candidates before updating the process', async () => {
    const s = setupUpdate();
    withCandidates(s, ['c-1']);
    const seen: Array<unknown> = [];
    s.fakes.spies.release.mockImplementationOnce(() => { seen.push({ ...s.fakes.processes.get('p-0') }); return Promise.resolve(true); });
    await s.service.update('p-0', { status: 'cancelled' }, ownerPm);
    expect(seen).toEqual([expect.objectContaining({ status: 'open', candidateIds: ['c-1'] })]);
    expect(s.fakes.processes.get('p-0')?.status).toBe('cancelled');
  });
});

describe('ProcessUpdateService.update combined and empty bodies', () => {
  it('should return the process unchanged for an empty patch without releasing anything', async () => {
    const s = setupUpdate();
    withCandidates(s, ['c-1']);
    expect(await s.service.update('p-0', {}, assignedRec)).toMatchObject({ title: 'T', status: 'open', candidateIds: ['c-1'] });
    expect(s.fakes.spies.release).not.toHaveBeenCalled();
  });

  it('should throw 403 and change nothing when the assigned recruiter sends recruiterId with a cancel', async () => {
    const s = setupUpdate();
    withCandidates(s, ['c-1']);
    await expect(s.service.update('p-0', { recruiterId: OTHER_REC, status: 'cancelled' }, assignedRec)).rejects.toBeInstanceOf(ForbiddenException);
    expect(s.fakes.spies.release).not.toHaveBeenCalled();
    expect(s.fakes.processes.get('p-0')).toMatchObject({ status: 'open', recruiterId: 'rec-1', candidateIds: ['c-1'] });
  });

  it('should throw 400 and release nothing when the owner cancels with an invalid recruiter', async () => {
    const s = setupUpdate();
    withCandidates(s, ['c-1']);
    await expect(s.service.update('p-0', { recruiterId: OTHER_PM, status: 'cancelled' }, ownerPm)).rejects.toBeInstanceOf(BadRequestException);
    expect(s.fakes.spies.release).not.toHaveBeenCalled();
    expect(s.fakes.candidates.get('c-1')?.processId).toBe('p-0');
    expect(s.fakes.processes.get('p-0')?.status).toBe('open');
  });

  it('should change recruiter and cancel together for the owner', async () => {
    const s = setupUpdate();
    withCandidates(s, ['c-1']);
    expect(await s.service.update('p-0', { recruiterId: OTHER_REC, status: 'cancelled' }, ownerPm)).toMatchObject({ recruiterId: OTHER_REC, status: 'cancelled', candidateIds: [] });
  });
});

describe('ProcessUpdateService.update error precedence', () => {
  it('should not grant rights to createdBy when it is neither owner nor recruiter', async () => {
    const s = setupUpdate();
    s.fakes.addProcess({ id: 'p-c', createdBy: actorOf(OTHER_PM, 'pm') });
    await expect(s.service.update('p-c', { title: 'X' }, actorOf(OTHER_PM, 'pm'))).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should answer 404 before 403 for an unknown process and an unauthorized actor', async () => {
    await expect(setupUpdate().service.update('nope', { title: 'X' }, actorOf(OTHER_PM, 'pm'))).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should answer 403 before terminal state for an unauthorized actor', async () => {
    const s = setupUpdate();
    s.fakes.addProcess({ id: 'p-t', status: 'closed' });
    await expect(s.service.update('p-t', { title: 'X' }, actorOf(OTHER_PM, 'pm'))).rejects.toBeInstanceOf(ForbiddenException);
  });
});

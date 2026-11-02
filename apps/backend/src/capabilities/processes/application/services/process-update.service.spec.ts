import { BadRequestException, ForbiddenException, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { OTHER_PM, OTHER_REC } from '../../testing/process-fakes';
import { actorOf, assignedRec, ownerPm, setupUpdate } from '../../testing/process-update.setup';

const bodyOf = (error: unknown): unknown => (error as BadRequestException).getResponse();

describe('ProcessUpdateService.update authorization', () => {
  it.each([
    ['another pm', actorOf(OTHER_PM, 'pm')],
    ['another recruiter', actorOf(OTHER_REC, 'recruiter')],
    ['a technical_ref', actorOf('tech-1', 'technical_ref')],
  ])('should throw 403 when %s edits', async (_label, actor) => {
    const { fakes, service } = setupUpdate();
    await expect(service.update('p-0', { title: 'X' }, actor)).rejects.toBeInstanceOf(ForbiddenException);
    expect(fakes.processes.get('p-0')?.title).toBe('T');
  });

  it('should throw 404 for an unknown process', async () => {
    const { service } = setupUpdate();
    await expect(service.update('nope', { title: 'X' }, ownerPm)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should let the owner pm and the assigned recruiter edit title and client', async () => {
    const { service } = setupUpdate();
    expect(await service.update('p-0', { title: 'A' }, ownerPm)).toMatchObject({ title: 'A', status: 'open' });
    expect(await service.update('p-0', { clientName: 'B' }, assignedRec)).toMatchObject({ title: 'A', clientName: 'B' });
  });
});

describe('ProcessUpdateService.update recruiter change', () => {
  it('should let only the owner pm change the recruiter', async () => {
    const { fakes, service } = setupUpdate();
    await expect(service.update('p-0', { recruiterId: OTHER_REC }, assignedRec)).rejects.toBeInstanceOf(ForbiddenException);
    expect(fakes.processes.get('p-0')?.recruiterId).toBe('rec-1');
    expect(await service.update('p-0', { recruiterId: OTHER_REC }, ownerPm)).toMatchObject({ recruiterId: OTHER_REC });
  });

  it('should throw 400 when the new recruiter is not a recruiter', async () => {
    const { service } = setupUpdate();
    await expect(service.update('p-0', { recruiterId: OTHER_PM }, ownerPm)).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.update('p-0', { recruiterId: 'ghost' }, ownerPm)).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('ProcessUpdateService.update status', () => {
  it('should move freely between non terminal states', async () => {
    const { service } = setupUpdate();
    for (const status of ['interviewing', 'in_progress', 'open', 'interviewing'] as const) {
      expect(await service.update('p-0', { status }, assignedRec)).toMatchObject({ status });
    }
  });

  it.each(['closed', 'cancelled'] as const)('should reject any patch with 400 PROCESS_TERMINAL_STATE once %s', async (terminal) => {
    const { fakes, service } = setupUpdate();
    fakes.addProcess({ id: 'p-t', status: terminal });
    const error: unknown = await service.update('p-t', { title: 'X' }, ownerPm).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(BadRequestException);
    expect(bodyOf(error)).toMatchObject({ statusCode: 400, code: 'PROCESS_TERMINAL_STATE' });
    await expect(service.update('p-t', { status: 'open' }, ownerPm)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should keep the candidates when closing', async () => {
    const { fakes, service } = setupUpdate();
    fakes.addProcess({ candidateIds: ['c-1'] });
    fakes.addCandidate('c-1', 'p-0');
    const detail = await service.update('p-0', { status: 'closed' }, assignedRec);
    expect(detail).toMatchObject({ status: 'closed', candidateIds: ['c-1'] });
    expect(fakes.candidates.get('c-1')?.processId).toBe('p-0');
  });

  it('should release the candidates before cancelling and empty candidateIds', async () => {
    const { fakes, service } = setupUpdate();
    fakes.addProcess({ candidateIds: ['c-1', 'c-2'] });
    fakes.addCandidate('c-1', 'p-0');
    fakes.addCandidate('c-2', 'p-0');
    const detail = await service.update('p-0', { status: 'cancelled' }, ownerPm);
    expect(detail).toMatchObject({ status: 'cancelled', candidateIds: [], candidates: [] });
    expect(fakes.candidates.get('c-1')?.processId).toBeUndefined();
    expect(fakes.candidates.get('c-2')?.processId).toBeUndefined();
  });

  it('should keep the process active, log and throw 503 PROCESS_RELEASE_FAILED when releasing fails', async () => {
    const { fakes, service } = setupUpdate();
    fakes.addProcess({ candidateIds: ['c-1'] });
    fakes.addCandidate('c-1', 'p-0');
    const error = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    fakes.spies.release.mockRejectedValue(new Error('mongo down'));
    const thrown: unknown = await service.update('p-0', { status: 'cancelled' }, ownerPm).catch((e: unknown) => e);
    expect(thrown).toBeInstanceOf(ServiceUnavailableException);
    expect(bodyOf(thrown)).toMatchObject({ code: 'PROCESS_RELEASE_FAILED' });
    expect(fakes.processes.get('p-0')).toMatchObject({ status: 'open', candidateIds: ['c-1'] });
    expect(error).toHaveBeenCalled();
    jest.restoreAllMocks();
  });
});

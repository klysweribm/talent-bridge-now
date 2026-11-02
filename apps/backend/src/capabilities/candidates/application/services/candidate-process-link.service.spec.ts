import type { ICandidate } from '@ibm-talent-bridge/shared-types';
import type { ICandidateRepositoryPort } from '../ports/candidate-repository.port';
import { CandidateProcessLinkService } from './candidate-process-link.service';

const candidate = (id: string, processId?: string): ICandidate => ({
  id, email: `${id}@example.test`, fullName: `Nombre ${id}`, primaryRole: 'Backend', status: 'tentative',
  createdAt: 'c', updatedAt: 'u', updateCount: 0, ...(processId ? { processId } : {}),
});

function setup(): {
  service: CandidateProcessLinkService; findByIds: jest.Mock; claimProcess: jest.Mock; releaseProcess: jest.Mock; findPage: jest.Mock;
} {
  const findByIds = jest.fn();
  const claimProcess = jest.fn();
  const releaseProcess = jest.fn();
  const findPage = jest.fn();
  const repository = { findByIds, claimProcess, releaseProcess, findPage } as unknown as ICandidateRepositoryPort;
  return { service: new CandidateProcessLinkService(repository), findByIds, claimProcess, releaseProcess, findPage };
}

describe('CandidateProcessLinkService', () => {
  it('should summarize candidates by ids without exposing contact data', async () => {
    const ctx = setup();
    const { service } = ctx;
    ctx.findByIds.mockResolvedValue([candidate('c-1', 'p-1'), candidate('c-2')]);

    const result = await service.findSummaries(['c-1', 'c-2']);

    expect(result).toEqual([
      { id: 'c-1', fullName: 'Nombre c-1', primaryRole: 'Backend', processId: 'p-1' },
      { id: 'c-2', fullName: 'Nombre c-2', primaryRole: 'Backend' },
    ]);
  });

  it('should return an empty list without querying when no ids are given', async () => {
    const ctx = setup();
    const { service } = ctx;
    await expect(service.findSummaries([])).resolves.toEqual([]);
    expect(ctx.findByIds).not.toHaveBeenCalled();
  });

});

describe('CandidateProcessLinkService claims', () => {
  it('should report assigned when the conditional claim succeeds', async () => {
    const ctx = setup();
    const { service } = ctx;
    ctx.claimProcess.mockResolvedValue(true);
    await expect(service.assign('c-1', 'p-1')).resolves.toBe('assigned');
    expect(ctx.claimProcess).toHaveBeenCalledWith('c-1', 'p-1');
  });

  it.each([
    ['already-assigned', candidate('c-1', 'p-1')],
    ['taken', candidate('c-1', 'p-2')],
    ['missing', null],
  ] as const)('should report %s when the claim fails', async (expected, found) => {
    const ctx = setup();
    const { service } = ctx;
    ctx.claimProcess.mockResolvedValue(false);
    ctx.findByIds.mockResolvedValue(found ? [found] : []);
    await expect(service.assign('c-1', 'p-1')).resolves.toBe(expected);
  });

  it('should release only through the conditional release', async () => {
    const ctx = setup();
    const { service } = ctx;
    ctx.releaseProcess.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    await expect(service.release('c-1', 'p-1')).resolves.toBe(true);
    await expect(service.release('c-1', 'p-2')).resolves.toBe(false);
  });

  it('should page the available candidates as summaries', async () => {
    const ctx = setup();
    const { service } = ctx;
    ctx.findPage.mockResolvedValue({ items: [candidate('c-1')], total: 21 });
    const page = await service.listAvailable(2, 10);
    expect(ctx.findPage).toHaveBeenCalledWith(2, 10, 'available');
    expect(page).toEqual({ data: [{ id: 'c-1', fullName: 'Nombre c-1', primaryRole: 'Backend' }], total: 21, page: 2, limit: 10, totalPages: 3 });
  });
});

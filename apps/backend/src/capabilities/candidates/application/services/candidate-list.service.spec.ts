import type { ICandidate } from '@ibm-talent-bridge/shared-types';
import type { ICandidateRepositoryPort } from '../ports/candidate-repository.port';
import { CandidateListService } from './candidate-list.service';

const candidate = (id: string, processId?: string): ICandidate => ({
  id, email: `${id}@example.test`, fullName: `Nombre ${id}`, phone: '+56 9 1234 5678', primaryRole: 'Backend', summary: 'resumen',
  status: 'tentative', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: 'u', updateCount: 0, ...(processId ? { processId } : {}),
});

function setup(): { service: CandidateListService; findPage: jest.Mock } {
  const findPage = jest.fn();
  const repository = { findPage } as unknown as ICandidateRepositoryPort;
  return { service: new CandidateListService(repository), findPage };
}

describe('CandidateListService', () => {
  it('should list without filter and map to list items without phone or CV data', async () => {
    const { service, findPage } = setup();
    findPage.mockResolvedValue({ items: [candidate('c-1', 'p-1'), candidate('c-2')], total: 2 });

    const result = await service.list(1, 20);

    expect(findPage).toHaveBeenCalledWith(1, 20, undefined);
    expect(result.data).toEqual([
      { id: 'c-1', fullName: 'Nombre c-1', email: 'c-1@example.test', primaryRole: 'Backend', processId: 'p-1', createdAt: '2026-01-01T00:00:00.000Z' },
      { id: 'c-2', fullName: 'Nombre c-2', email: 'c-2@example.test', primaryRole: 'Backend', createdAt: '2026-01-01T00:00:00.000Z' },
    ]);
    expect(result.data.every((item) => !('phone' in item) && !('summary' in item))).toBe(true);
  });

  it.each(['available', 'assigned'] as const)('should pass the %s filter to the port', async (assignment) => {
    const { service, findPage } = setup();
    findPage.mockResolvedValue({ items: [], total: 0 });
    await service.list(1, 20, assignment);
    expect(findPage).toHaveBeenCalledWith(1, 20, assignment);
  });

  it('should paginate with totals', async () => {
    const { service, findPage } = setup();
    findPage.mockResolvedValue({ items: [candidate('c-3')], total: 5 });
    await expect(service.list(3, 2)).resolves.toMatchObject({ total: 5, page: 3, limit: 2, totalPages: 3 });
  });
});

import type { ICandidateListItem, PaginatedResponse } from '@ibm-talent-bridge/shared-types';
import { as, createCandidate } from './support/processes-e2e.helpers';
import { useProcessCandidatesApp } from './support/process-candidates-e2e.helpers';

jest.setTimeout(30_000);

type TPage = PaginatedResponse<ICandidateListItem>;

describe('GET /candidates', () => {
  const k = useProcessCandidatesApp('candlist1');
  const { ctx, mariana, ana } = k;
  const get = async (user: ReturnType<typeof ana>, query = ''): Promise<TPage> =>
    (await as(ctx(), user, 'get', `/candidates${query}`).expect(200)).body as TPage;

  it('should list candidates with name and email but never phone, for recruiter and pm', async () => {
    await createCandidate(ctx(), ana(), 'Persona Listada');
    for (const user of [ana(), mariana()]) {
      const page = await get(user, '?limit=50');
      expect(page).toMatchObject({ page: 1, limit: 50 });
      expect(page.total).toBeGreaterThan(0);
      const item = page.data[0] as unknown as Record<string, unknown>;
      expect(typeof item.fullName).toBe('string');
      expect(typeof item.email).toBe('string');
      expect(typeof item.createdAt).toBe('string');
      expect(Object.keys(item)).not.toContain('phone');
      expect(Object.keys(item).every((key) => ['id', 'fullName', 'email', 'primaryRole', 'processId', 'createdAt'].includes(key))).toBe(true);
    }
  });

});

describe('GET /candidates assignment filter', () => {
  const k = useProcessCandidatesApp('candlist3');
  const { ctx, mariana, ana, newProcess, associate } = k;
  const get = async (query = ''): Promise<TPage> => (await as(ctx(), ana(), 'get', `/candidates${query}`).expect(200)).body as TPage;

  it('should filter by assignment and expose processId', async () => {
    const busy = await createCandidate(ctx(), ana(), 'Asignado Listado');
    const free = await createCandidate(ctx(), ana(), 'Libre Listado');
    const process = await newProcess(mariana());
    await associate(mariana(), process.id, busy).expect(201);

    const all = (await get('?limit=50')).data;
    expect(all.find((item) => item.id === busy)?.processId).toBe(process.id);
    expect(all.find((item) => item.id === free)?.processId).toBeUndefined();
    const available = (await get('?limit=50&assignment=available')).data.map((item) => item.id);
    expect(available).toContain(free);
    expect(available).not.toContain(busy);
    const assigned = (await get('?limit=50&assignment=assigned')).data.map((item) => item.id);
    expect(assigned).toContain(busy);
    expect(assigned).not.toContain(free);
  });

});

describe('GET /candidates guards and pagination', () => {
  const k = useProcessCandidatesApp('candlist2');
  const { ctx, ana } = k;
  const get = async (query = ''): Promise<TPage> => (await as(ctx(), ana(), 'get', `/candidates${query}`).expect(200)).body as TPage;

  it('should paginate with total and totalPages', async () => {
    await createCandidate(ctx(), ana(), 'Pagina Uno');
    await createCandidate(ctx(), ana(), 'Pagina Dos');
    const page = await get('?limit=1');
    expect(page.data).toHaveLength(1);
    expect(page.totalPages).toBe(page.total);
    expect((await get('?limit=1&page=2')).data[0].id).not.toBe(page.data[0].id);
  });

  it('should reject bad query, wrong role and missing token; and keep /available working', async () => {
    await as(ctx(), ana(), 'get', '/candidates?assignment=todos').expect(400);
    await as(ctx(), ana(), 'get', '/candidates?limit=51').expect(400);
    await as(ctx(), ctx().users.carlos, 'get', '/candidates').expect(403);
    await as(ctx(), undefined, 'get', '/candidates').expect(401);
    await as(ctx(), ana(), 'get', '/candidates/available').expect(200);
  });
});

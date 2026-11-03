import { as } from './support/processes-e2e.helpers';
import { useSearchApp, type TListPage } from './support/processes-search-e2e.helpers';

jest.setTimeout(30_000);

describe('GET /processes?q= matching', () => {
  const { search, titles } = useSearchApp('procsearch');

  it('should match title, client and opportunity role, case-insensitive and partial', async () => {
    expect(titles(await search('BANCA'))).toEqual(['Banca Digital']);
    expect(titles(await search('tienda'))).toEqual(['Retail Core']);
    expect(titles(await search('senior jav'))).toEqual(['Retail Core']);
    expect(titles(await search('  qa lead  '))).toEqual(['Seguros (v2) [beta]']);
  });

  it.each([['.*'], ['('], ['['], ['\\'], ['+'], ['(v2)'], ['[beta]']])('should treat %j literally and not break', async (q) => {
    for (const item of (await search(q)).data) expect(`${item.title}|${item.clientName}|${item.opportunityRole}`).toContain(q);
  });

  it('should find literal special characters only where they appear', async () => {
    expect(titles(await search('.*'))).toEqual(['Regex .* test']);
    expect(titles(await search('\\'))).toEqual(['Regex .* test']);
    expect(titles(await search('(v2)'))).toEqual(['Seguros (v2) [beta]']);
  });

  it('should return an empty page without results and match legacy processes by title/client', async () => {
    expect(await search('zzz-nada')).toMatchObject({ data: [], total: 0, totalPages: 0 });
    expect(titles(await search('legacy'))).toEqual(['Proceso Legacy']);
    expect(titles(await search('viejo'))).toEqual(['Proceso Legacy']);
  });
});

describe('GET /processes?q= pagination and validation', () => {
  const { ctx, search } = useSearchApp('procsearchpg');
  const get = (path: string): ReturnType<typeof as> => as(ctx(), ctx().users.ana, 'get', path);

  it('should paginate with q and compute total and totalPages from the filter', async () => {
    expect(await search('plano', '&limit=1&page=1')).toMatchObject({ total: 1, totalPages: 1, page: 1, limit: 1 });
    const all = await search('a', '&limit=2&page=1');
    expect(all.data).toHaveLength(2);
    expect(all.totalPages).toBe(Math.ceil(all.total / 2));
    expect((await search('a', `&limit=2&page=${all.totalPages}`)).data.length).toBeGreaterThan(0);
    const beyond = await search('a', `&limit=2&page=${all.totalPages + 1}`);
    expect([beyond.data, beyond.total]).toEqual([[], all.total]);
  });

  it('should treat empty or blank q as no filter and answer 400 for a repeated q or one over 100 chars', async () => {
    const unfiltered = (await get('/processes').expect(200)).body as TListPage;
    expect((await search('')).total).toBe(unfiltered.total);
    expect((await search('   ')).total).toBe(unfiltered.total);
    await get('/processes?q=a&q=b').expect(400);
    await get(`/processes?q=${'a'.repeat(101)}`).expect(400);
  });

  it('should keep permissions: 401 without token and 403 for technical_ref with q', async () => {
    await as(ctx(), undefined, 'get', '/processes?q=a').expect(401);
    const tech = { id: 't1', email: 'tech@ibm.com', role: 'technical_ref', fullName: 'Tech' } as const;
    await as(ctx(), tech, 'get', '/processes?q=a').expect(403);
  });
});

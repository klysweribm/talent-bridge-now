import type { IBenchResource } from '@ibm-talent-bridge/shared-types';
import { SEED, VISIBLE, get, page, skillNames, useBenchApp } from './support/bench-e2e.helpers';

jest.setTimeout(30_000);

describe('Bench skills and seniority filters', () => {
  const app = useBenchApp('skills');

  it.each([
    ['comma form', 'skills=Java,Spring Boot&seniority=sr'],
    ['repeated form', 'skills=Java&skills=Spring Boot&seniority=sr'],
    ['any letter case', 'skills=java,spring boot&seniority=sr'],
  ])('should return only sr resources with both Java and Spring Boot using the %s', async (_l, query) => {
    const body = await page(app.ctx, `?${query}`);
    const hasBoth = (item: IBenchResource): boolean =>
      item.seniority === 'sr' && skillNames(item).includes('Java') && skillNames(item).includes('Spring Boot');

    expect(body.total).toBeGreaterThanOrEqual(2);
    expect(body.data.every(hasBoth)).toBe(true);
  });

  it('should treat regex metacharacters in skills as plain text', async () => {
    expect(await page(app.ctx, '?skills=.*')).toMatchObject({ data: [], total: 0 });
  });

  it('should return 200 with an empty page when nothing matches', async () => {
    expect(await page(app.ctx, '?skills=Cobol,React')).toMatchObject({ data: [], total: 0, totalPages: 0 });
  });
});

describe('Bench availableBy, country and status filters', () => {
  const app = useBenchApp('dates');

  it('should include resources available exactly on the availableBy date', async () => {
    const cutoff = VISIBLE.map((item) => item.availableFrom).sort()[5];
    const body = await page(app.ctx, `?availableBy=${cutoff}&limit=50`);

    expect(body.total).toBe(VISIBLE.filter((item) => item.availableFrom <= cutoff).length);
    expect(body.data.some((item) => item.availableFrom === cutoff)).toBe(true);
    expect(body.data.every((item) => item.availableFrom <= cutoff)).toBe(true);
  });

  it('should return only resources of the given country', async () => {
    const body = await page(app.ctx, '?country=Chile&limit=50');

    expect(body.total).toBe(VISIBLE.filter((item) => item.location.country === 'Chile').length);
    expect(body.data.every((item) => item.location.country === 'Chile')).toBe(true);
  });

  it('should return only assigned resources when status=assigned', async () => {
    const body = await page(app.ctx, '?status=assigned');

    expect(body.total).toBe(SEED.filter((item) => item.status === 'assigned').length);
    expect(body.data.every((item) => item.status === 'assigned')).toBe(true);
  });
});

describe('Bench skills catalogue and detail', () => {
  const app = useBenchApp('detail');

  it('should return distinct skill names sorted alphabetically', async () => {
    const body = (await get(app.ctx, '/skills', 'pm').expect(200)).body as string[];

    expect(new Set(body).size).toBe(body.length);
    expect(body).toEqual([...body].sort((a, b) => a.localeCompare(b)));
    expect(body).toEqual(expect.arrayContaining(['Java', 'Spring Boot']));
  });

  it('should offer only skills of visible resources, not those that exist only on assigned ones', async () => {
    const body = (await get(app.ctx, '/skills', 'recruiter').expect(200)).body as string[];

    expect(body).not.toEqual(expect.arrayContaining(['Linux']));
    expect(body).not.toContain('Git');
    expect(body).not.toContain('MuleSoft');
    expect(body).toEqual(expect.arrayContaining(['Java', 'Spring Boot']));
  });

  it('should return the resource when the benchCode exists', async () => {
    const body = (await get(app.ctx, '/BN-0001', 'recruiter').expect(200)).body as IBenchResource;

    expect(body.benchCode).toBe('BN-0001');
    expect(typeof body.id).toBe('string');
  });

  it('should return 404 when the benchCode is unknown', async () => {
    await get(app.ctx, '/BN-9999', 'recruiter').expect(404);
  });
});

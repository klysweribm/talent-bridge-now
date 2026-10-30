import type { UserRole } from '@ibm-talent-bridge/shared-types';
import { DEFAULT_PAGE_SIZE, SEED, VISIBLE, get, page, useBenchApp } from './support/bench-e2e.helpers';

/**
 * Integración BENCH-1 (lista, auth, validación): pipeline HTTP real + `BenchModule`
 * completo contra MongoDB real. BD descartable propia que se elimina al terminar.
 */
jest.setTimeout(30_000);

describe('Bench authentication and roles', () => {
  const app = useBenchApp('auth');

  it('should return 401 when no token is sent', async () => {
    await get(app.ctx, '').expect(401);
  });

  it('should return 403 when the role is technical_ref', async () => {
    await get(app.ctx, '', 'technical_ref').expect(403);
  });

  it.each<UserRole>(['recruiter', 'pm'])('should return 200 when the role is %s', async (role) => {
    await get(app.ctx, '', role).expect(200);
  });
});

describe('Bench default list', () => {
  const app = useBenchApp('list');

  it('should return 20 items ordered by availableFrom then benchCode, without assigned ones', async () => {
    const body = await page(app.ctx, '');
    const expected = [...VISIBLE]
      .sort((a, b) => a.availableFrom.localeCompare(b.availableFrom) || a.benchCode.localeCompare(b.benchCode))
      .slice(0, DEFAULT_PAGE_SIZE)
      .map((item) => item.benchCode);

    expect(body.data).toHaveLength(DEFAULT_PAGE_SIZE);
    expect(body.total).toBe(VISIBLE.length);
    expect(body.totalPages).toBe(Math.ceil(VISIBLE.length / DEFAULT_PAGE_SIZE));
    expect(body.data.map((item) => item.benchCode)).toEqual(expected);
    expect(body.data.every((item) => item.status !== 'assigned')).toBe(true);
  });

  it('should return the remaining items on page 2', async () => {
    const body = await page(app.ctx, '?page=2');

    expect(body.data).toHaveLength(VISIBLE.length - DEFAULT_PAGE_SIZE);
    expect(body.page).toBe(2);
  });

  it('should not expose email or phone fields', async () => {
    expect(JSON.stringify(await page(app.ctx, ''))).not.toMatch(/email|phone|salary/i);
  });

  it('should count every seeded resource when all statuses are requested', async () => {
    const body = await page(app.ctx, '?status=available,soft_booked,assigned&limit=50');

    expect(body.total).toBe(SEED.length);
  });
});

describe('Bench invalid query params', () => {
  const app = useBenchApp('invalid');

  it.each(['limit=500', 'limit=0', 'page=0', 'seniority=guru', 'availableBy=no-es-fecha', 'availableBy=2026-W44', 'availableBy=2026-W44-3', 'availableBy=2026-305', 'availableBy=2026-02-30'])(
    'should return 400 when the query is %s',
    async (query) => {
      await get(app.ctx, `?${query}`, 'recruiter').expect(400);
    },
  );
});

import type { IUserOption, PaginatedResponse } from '@ibm-talent-bridge/shared-types';
import { as, buildProcessesApp, closeProcessesApp, type IProcessesContext } from './support/processes-e2e.helpers';

jest.setTimeout(30_000);

describe('GET /users', () => {
  let ctx: IProcessesContext;
  beforeAll(async () => { ctx = await buildProcessesApp('users'); });
  afterAll(() => closeProcessesApp(ctx));

  it('should return 401 without a token', async () => {
    await as(ctx, undefined, 'get', '/users?role=pm').expect(401);
  });

  it('should return 403 for technical_ref', async () => {
    await as(ctx, ctx.users.carlos, 'get', '/users?role=pm').expect(403);
  });

  it.each(['', '?role=technical_ref', '?role=admin', '?role=pm&limit=51', '?role=pm&page=0'])('should return 400 for query %p', async (query) => {
    await as(ctx, ctx.users.ana, 'get', `/users${query}`).expect(400);
  });

  it('should list only pms as { id, fullName } for a recruiter', async () => {
    const body = (await as(ctx, ctx.users.ana, 'get', '/users?role=pm').expect(200)).body as PaginatedResponse<IUserOption>;
    expect(body).toMatchObject({ total: 1, page: 1, limit: 20, totalPages: 1 });
    expect(body.data).toEqual([{ id: ctx.users.mariana.id, fullName: ctx.users.mariana.fullName }]);
  });

  it('should list recruiters for a pm and paginate', async () => {
    const body = (await as(ctx, ctx.users.mariana, 'get', '/users?role=recruiter&limit=1').expect(200)).body as PaginatedResponse<IUserOption>;
    expect(body.data).toEqual([{ id: ctx.users.ana.id, fullName: ctx.users.ana.fullName }]);
    expect(Object.keys(body.data[0]).sort()).toEqual(['fullName', 'id']);
  });
});

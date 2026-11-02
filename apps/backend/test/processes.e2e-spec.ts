import type { IProcess, IProcessLimits, IProcessDetail, IProcessListItem, PaginatedResponse } from '@ibm-talent-bridge/shared-types';
import { as, buildProcessesApp, closeProcessesApp, type IProcessesContext } from './support/processes-e2e.helpers';

jest.setTimeout(30_000);

const BODY = { title: 'Proceso Inventado', clientName: 'Cliente Inventado' };

describe('Processes', () => {
  let ctx: IProcessesContext;
  beforeAll(async () => { ctx = await buildProcessesApp('proc'); });
  afterAll(() => closeProcessesApp(ctx));

  const post = (user: Parameters<typeof as>[1], body: object): ReturnType<typeof as> => as(ctx, user, 'post', '/processes').send(body);

  it('should return 401 without a token and 403 for technical_ref on every endpoint', async () => {
    await as(ctx, undefined, 'post', '/processes').send(BODY).expect(401);
    await as(ctx, undefined, 'get', '/processes').expect(401);
    await post(ctx.users.carlos, BODY).expect(403);
    await as(ctx, ctx.users.carlos, 'get', '/processes').expect(403);
    await as(ctx, ctx.users.carlos, 'get', '/processes/507f1f77bcf86cd799439011').expect(403);
  });

  it('should create as pm: owner from the JWT, body ownerPmId ignored, recruiter optional', async () => {
    const response = await post(ctx.users.mariana, { ...BODY, ownerPmId: ctx.users.ana.id, recruiterId: ctx.users.ana.id }).expect(201);
    expect(response.body as IProcess).toMatchObject({
      ownerPmId: ctx.users.mariana.id, recruiterId: ctx.users.ana.id, candidateIds: [], maxCandidates: 7,
      createdBy: { id: ctx.users.mariana.id, email: ctx.users.mariana.email, role: 'pm' },
    });
    const none = (await post(ctx.users.mariana, BODY).expect(201)).body as IProcess;
    expect(none.recruiterId).toBeNull();
  });

  it('should create as recruiter with a pm, taking the recruiter from the JWT', async () => {
    const created = (await post(ctx.users.ana, { ...BODY, ownerPmId: ctx.users.mariana.id }).expect(201)).body as IProcess;
    expect(created).toMatchObject({ ownerPmId: ctx.users.mariana.id, recruiterId: ctx.users.ana.id });
    expect(typeof created.createdAt).toBe('string');
  });

});

describe('Processes validation', () => {
  let ctx: IProcessesContext;
  beforeAll(async () => { ctx = await buildProcessesApp('procval'); });
  afterAll(() => closeProcessesApp(ctx));
  const post = (user: Parameters<typeof as>[1], body: object): ReturnType<typeof as> => as(ctx, user, 'post', '/processes').send(body);

  it.each([
    ['recruiter without ownerPmId', 'ana', {}],
    ['recruiter with a non-pm owner', 'ana', { ownerPmId: 'carlos' }],
    ['recruiter with a missing owner', 'ana', { ownerPmId: '507f1f77bcf86cd799439011' }],
    ['pm with a non-recruiter recruiterId', 'mariana', { recruiterId: 'carlos' }],
    ['empty title', 'mariana', { title: '  ' }],
    ['unknown field', 'mariana', { hack: 1 }],
  ] as ReadonlyArray<readonly [string, 'ana' | 'mariana', Readonly<Record<string, unknown>>]>)('should return 400 for %s', async (_label, who, extra) => {
    const resolved: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(extra)) resolved[key] = value === 'carlos' ? ctx.users.carlos.id : value;
    await post(ctx.users[who], { ...BODY, ...resolved }).expect(400);
  });

});

describe('Processes reads', () => {
  let ctx: IProcessesContext;
  beforeAll(async () => { ctx = await buildProcessesApp('procread'); });
  afterAll(() => closeProcessesApp(ctx));
  const post = (user: Parameters<typeof as>[1], body: object): ReturnType<typeof as> => as(ctx, user, 'post', '/processes').send(body);

  it('should list paginated items without candidateIds', async () => {
    await post(ctx.users.mariana, BODY).expect(201);
    await post(ctx.users.mariana, BODY).expect(201);
    const body = (await as(ctx, ctx.users.ana, 'get', '/processes?limit=1').expect(200)).body as PaginatedResponse<IProcessListItem>;
    expect(body.data).toHaveLength(1);
    expect(body.total).toBe(2);
    expect(body.data[0]).toMatchObject({ candidateCount: 0, maxCandidates: 7 });
    expect(body.data[0]).not.toHaveProperty('candidateIds');
    await as(ctx, ctx.users.ana, 'get', '/processes?limit=51').expect(400);
  });

  it('should return the detail, 404 for unknown ids and 400 for malformed ids', async () => {
    const created = (await post(ctx.users.mariana, BODY).expect(201)).body as IProcess;
    const detail = (await as(ctx, ctx.users.ana, 'get', `/processes/${created.id}`).expect(200)).body as IProcessDetail;
    expect(detail).toMatchObject({ id: created.id, candidates: [], candidateIds: [], maxCandidates: 7 });
    await as(ctx, ctx.users.ana, 'get', '/processes/507f1f77bcf86cd799439011').expect(404);
    await as(ctx, ctx.users.ana, 'get', '/processes/not-an-id').expect(400);
  });
});

describe('Processes limits', () => {
  let ctx: IProcessesContext;
  beforeAll(async () => { ctx = await buildProcessesApp('proclim'); });
  afterAll(() => closeProcessesApp(ctx));

  it.each(['ana', 'mariana'] as const)('should return 200 with the configured maxCandidates for %s, not captured by :id', async (who) => {
    const limits = (await as(ctx, ctx.users[who], 'get', '/processes/limits').expect(200)).body as IProcessLimits;
    const created = (await as(ctx, ctx.users.mariana, 'post', '/processes').send(BODY).expect(201)).body as IProcess;
    expect(limits).toEqual({ maxCandidates: created.maxCandidates });
  });

  it('should return 401 without a token and 403 for technical_ref', async () => {
    await as(ctx, undefined, 'get', '/processes/limits').expect(401);
    await as(ctx, ctx.users.carlos, 'get', '/processes/limits').expect(403);
  });
});

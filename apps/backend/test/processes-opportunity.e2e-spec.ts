import type { IProcess } from '@ibm-talent-bridge/shared-types';
import { as, buildProcessesApp, closeProcessesApp, OPPORTUNITY, type IProcessesContext } from './support/processes-e2e.helpers';

jest.setTimeout(30_000);

const BODY = { title: 'Proceso Inventado', clientName: 'Cliente Inventado', ...OPPORTUNITY };

describe('Processes opportunity fields', () => {
  let ctx: IProcessesContext;
  beforeAll(async () => { ctx = await buildProcessesApp('procopp'); });
  afterAll(() => closeProcessesApp(ctx));
  const post = (body: object): ReturnType<typeof as> => as(ctx, ctx.users.mariana, 'post', '/processes').send(body);

  it('should create with the opportunity fields, deduplicating skills', async () => {
    const created = (await post({ ...BODY, skills: [' React ', 'react', 'AWS'] }).expect(201)).body as IProcess;
    expect(created).toMatchObject({ opportunityRole: OPPORTUNITY.opportunityRole, skills: ['React', 'AWS'], roleDescription: OPPORTUNITY.roleDescription, band: 8 });
  });

  it('should store and return startDate, and read it as null when it was not sent', async () => {
    const withDate = (await post({ ...BODY, startDate: '2026-12-01' }).expect(201)).body as IProcess;
    expect(withDate.startDate).toBe('2026-12-01');
    const without = (await post(BODY).expect(201)).body as IProcess;
    expect(without.startDate).toBeNull();
  });

  it('should let a PATCH set startDate and reject an invalid one', async () => {
    const created = (await post(BODY).expect(201)).body as IProcess;
    const patch = (body: object): ReturnType<typeof as> => as(ctx, ctx.users.mariana, 'patch', `/processes/${created.id}`).send(body);
    expect((await patch({ startDate: '2027-01-15' }).expect(200)).body).toMatchObject({ startDate: '2027-01-15' });
    await patch({ startDate: '2026-02-30' }).expect(400);
  });

  it.each(['opportunityRole', 'skills', 'roleDescription', 'band'])('should return 400 when %s is missing', async (field) => {
    const rest = Object.fromEntries(Object.entries(BODY).filter(([key]) => key !== field));
    await post(rest).expect(400);
  });

  it.each([{ band: 5 }, { band: 11 }, { band: 7.5 }, { band: '8' }, { skills: [] }, { skills: ['', 'x'] }, { roleDescription: '  ' }, { opportunityRole: '' }])(
    'should return 400 for %j', async (extra) => {
      await post({ ...BODY, ...extra }).expect(400);
    });
});

import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import type { IProcessDetail, IProcessListItem, PaginatedResponse } from '@ibm-talent-bridge/shared-types';
import { ProcessModel, type ProcessDocument } from '../src/capabilities/processes/infrastructure/adapters/process.schema';
import { as, buildProcessesApp, closeProcessesApp, type IProcessesContext } from './support/processes-e2e.helpers';

jest.setTimeout(30_000);

describe('Legacy processes without opportunity fields', () => {
  let ctx: IProcessesContext;
  beforeAll(async () => { ctx = await buildProcessesApp('proclegacy'); });
  afterAll(() => closeProcessesApp(ctx));

  const insertLegacy = async (): Promise<string> => {
    const model = ctx.app.get<Model<ProcessDocument>>(getModelToken(ProcessModel.name));
    const now = new Date();
    const { insertedId } = await model.collection.insertOne({
      title: 'Viejo', clientName: 'Cliente', ownerPmId: ctx.users.mariana.id, recruiterId: ctx.users.ana.id, status: 'open', candidateIds: [],
      createdBy: { id: ctx.users.mariana.id, email: ctx.users.mariana.email, role: 'pm' }, createdAt: now, updatedAt: now,
    });
    return insertedId.toString();
  };

  it('should read the detail and the list with neutral values', async () => {
    const id = await insertLegacy();
    const detail = (await as(ctx, ctx.users.ana, 'get', `/processes/${id}`).expect(200)).body as IProcessDetail;
    expect(detail).toMatchObject({ opportunityRole: '', skills: [], roleDescription: '', band: null, startDate: null });
    const list = (await as(ctx, ctx.users.ana, 'get', '/processes').expect(200)).body as PaginatedResponse<IProcessListItem>;
    expect(list.data.find((item) => item.id === id)).toMatchObject({ skills: [], band: null });
  });

  it('should let a PATCH fill the opportunity fields of a legacy process', async () => {
    const id = await insertLegacy();
    const body = { opportunityRole: 'Tech Lead', skills: ['Java'], roleDescription: 'Lidera', band: 9 };
    expect((await as(ctx, ctx.users.mariana, 'patch', `/processes/${id}`).send(body).expect(200)).body).toMatchObject(body);
    expect((await as(ctx, ctx.users.ana, 'get', `/processes/${id}`).expect(200)).body).toMatchObject(body);
  });
});

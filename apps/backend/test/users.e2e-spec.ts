import type { IUserOption, PaginatedResponse } from '@ibm-talent-bridge/shared-types';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { UserModel, type UserDocument } from '../src/capabilities/auth/infrastructure/adapters/user.schema';
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

  it.each(['', '?role=admin', '?role=pm&limit=51', '?role=pm&page=0'])('should return 400 for query %p', async (query) => {
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

  describe('role=technical_ref', () => {
    const list = (user: Parameters<typeof as>[1], query = ''): Promise<PaginatedResponse<IUserOption>> =>
      as(ctx, user, 'get', `/users?role=technical_ref${query}`).expect(200).then((r) => r.body as PaginatedResponse<IUserOption>);

    it('should answer 401 without token and 403 for a technical_ref', async () => {
      await as(ctx, undefined, 'get', '/users?role=technical_ref').expect(401);
      await as(ctx, ctx.users.carlos, 'get', '/users?role=technical_ref').expect(403);
    });

    it('should list active referents ordered by name for a recruiter and a pm', async () => {
      for (const user of [ctx.users.ana, ctx.users.mariana]) {
        const body = await list(user);
        expect(body.data.map((u) => u.fullName)).toEqual(['Carlos Londoño', 'Martín Rivas', 'Sofía Valenzuela']);
        expect(body).toMatchObject({ total: 3, page: 1, limit: 20, totalPages: 1 });
        expect(body.data.find((u) => u.fullName === 'Martín Rivas')).toEqual({ id: expect.any(String) as string, fullName: 'Martín Rivas', band: 8 });
      }
    });

    it('should paginate and keep the count coherent', async () => {
      const body = await list(ctx.users.ana, '&limit=2&page=2');
      expect(body).toMatchObject({ total: 3, page: 2, limit: 2, totalPages: 2 });
      expect(body.data).toHaveLength(1);
    });

    it('should not list inactive referents nor count them', async () => {
      const model = ctx.app.get<Model<UserDocument>>(getModelToken(UserModel.name));
      await model.updateOne({ email: 'martin.rivas@ibm.com' }, { $set: { status: 'inactive' } }).exec();
      const body = await list(ctx.users.ana);
      expect(body.data.map((u) => u.fullName)).toEqual(['Carlos Londoño', 'Sofía Valenzuela']);
      expect(body.total).toBe(2);
      await model.updateOne({ email: 'martin.rivas@ibm.com' }, { $set: { status: 'active' } }).exec();
    });

    it('should read a legacy referent without the new fields as active', async () => {
      const model = ctx.app.get<Model<UserDocument>>(getModelToken(UserModel.name));
      await model.collection.insertOne({ email: 'legacy.ref@ibm.com', fullName: 'Zeta Legacy', role: 'technical_ref', timezone: 'UTC', createdAt: new Date(), updatedAt: new Date() });
      const body = await list(ctx.users.ana);
      expect(body.data.map((u) => u.fullName)).toContain('Zeta Legacy');
      expect(body.data.find((u) => u.fullName === 'Zeta Legacy')).toEqual({ id: expect.any(String) as string, fullName: 'Zeta Legacy' });
      await model.deleteOne({ email: 'legacy.ref@ibm.com' }).exec();
    });
  });
});

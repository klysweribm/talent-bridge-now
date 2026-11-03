import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { UserModel, type UserDocument } from '../src/capabilities/auth/infrastructure/adapters/user.schema';
import { as } from './support/processes-e2e.helpers';
import { useSearchApp } from './support/processes-search-e2e.helpers';

jest.setTimeout(30_000);

describe('GET /processes technicalRefs', () => {
  const { ctx, create, search } = useSearchApp('proclistrefs');

  it('should return {id, fullName, avatarUrl?} without email, band or description; legacy as []', async () => {
    const users = ctx().app.get<Model<UserDocument>>(getModelToken(UserModel.name));
    const martin = (await users.findOne({ email: 'martin.rivas@ibm.com' }).orFail().exec())._id.toString();
    const id = await create('Con Referente', 'Cliente Ref', 'Rol Ref');
    await as(ctx(), ctx().users.mariana, 'patch', `/processes/${id}`).send({ technicalRefIds: [martin] }).expect(200);
    const page = await search('con referente');
    expect(page.data[0].technicalRefs).toEqual([{ id: martin, fullName: 'Martín Rivas' }]);
    expect(JSON.stringify(page.data[0].technicalRefs)).not.toMatch(/email|band|description|role|status/);
    expect((await search('legacy')).data[0].technicalRefs).toEqual([]);
  });
});

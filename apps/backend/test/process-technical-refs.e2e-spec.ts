import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import type { IProcessDetail } from '@ibm-talent-bridge/shared-types';
import { UserModel, type UserDocument } from '../src/capabilities/auth/infrastructure/adapters/user.schema';
import { ProcessModel, type ProcessDocument } from '../src/capabilities/processes/infrastructure/adapters/process.schema';
import { as } from './support/processes-e2e.helpers';
import { useProcessCandidatesApp } from './support/process-candidates-e2e.helpers';

jest.setTimeout(30_000);

describe('PATCH /processes/:id technicalRefIds', () => {
  const k = useProcessCandidatesApp('proctech');
  const { ctx, mariana, ana, newProcess } = k;
  const patch = (user: Parameters<typeof as>[1], id: string, body: object): ReturnType<typeof as> => as(ctx(), user, 'patch', `/processes/${id}`).send(body);
  const userModel = (): Model<UserDocument> => ctx().app.get<Model<UserDocument>>(getModelToken(UserModel.name));
  const idOf = async (email: string): Promise<string> => (await userModel().findOne({ email }).orFail().exec())._id.toString();

  it('should enforce the role matrix: 401, 403 for technical_ref and other pm/recruiter, 200 for owner pm and assigned recruiter', async () => {
    const carlos = await idOf('carlos@ibm.com');
    const p = await newProcess(mariana(), { recruiterId: ana().id });
    await patch(undefined, p.id, { technicalRefIds: [carlos] }).expect(401);
    await patch(ctx().users.carlos, p.id, { technicalRefIds: [carlos] }).expect(403);
    const foreign = (await as(ctx(), ana(), 'post', '/processes').send({ title: 'T', clientName: 'C', opportunityRole: 'R', skills: ['a'], roleDescription: 'D', band: 8, ownerPmId: mariana().id }).expect(201)).body as { id: string };
    await patch(ana(), foreign.id, { technicalRefIds: [carlos] }).expect(200); // ana es la reclutadora asignada ahí
    const noRec = await newProcess(mariana());
    await patch(ana(), noRec.id, { technicalRefIds: [carlos] }).expect(403);
    await patch(mariana(), p.id, { technicalRefIds: [carlos] }).expect(200);
    await patch(ana(), p.id, { technicalRefIds: [] }).expect(200);
  });

  it('should assign two, replace, clear, and return the full profile in the PATCH and in the GET detail', async () => {
    const [martin, sofia] = [await idOf('martin.rivas@ibm.com'), await idOf('sofia.valenzuela@ibm.com')];
    const p = await newProcess(mariana());
    const first = (await patch(mariana(), p.id, { technicalRefIds: [sofia, martin] }).expect(200)).body as IProcessDetail;
    expect(first.technicalRefIds).toEqual([sofia, martin]);
    expect(first.technicalRefs.map((r) => r.fullName)).toEqual(['Sofía Valenzuela', 'Martín Rivas']);
    expect(first.technicalRefs[1]).toEqual({
      id: martin, fullName: 'Martín Rivas', email: 'martin.rivas@ibm.com', role: 'technical_ref', band: 8, description: expect.any(String) as string, status: 'active',
    });
    expect(first.technicalRefs[1].description).not.toBe('');
    expect('avatarUrl' in first.technicalRefs[1]).toBe(false);
    expect(JSON.stringify(first)).not.toMatch(/phone|cv/i);
    const got = (await as(ctx(), ana(), 'get', `/processes/${p.id}`).expect(200)).body as IProcessDetail;
    expect(got.technicalRefs).toEqual(first.technicalRefs);
    expect((await patch(mariana(), p.id, { technicalRefIds: [martin] }).expect(200)).body).toMatchObject({ technicalRefIds: [martin] });
    expect((await patch(mariana(), p.id, { technicalRefIds: [] }).expect(200)).body).toMatchObject({ technicalRefIds: [], technicalRefs: [] });
  });

  it('should answer 400 for 3 ids, duplicates, null, non array, unknown/wrong role/inactive ids with a stable code', async () => {
    const [martin, sofia, carlos] = [await idOf('martin.rivas@ibm.com'), await idOf('sofia.valenzuela@ibm.com'), await idOf('carlos@ibm.com')];
    const p = await newProcess(mariana());
    for (const body of [[martin, sofia, carlos], [martin, martin], null, martin, ['']]) await patch(mariana(), p.id, { technicalRefIds: body }).expect(400);
    for (const ids of [['507f1f77bcf86cd799439011'], ['not-an-id'], [ana().id], [mariana().id]]) {
      const res = await patch(mariana(), p.id, { technicalRefIds: ids }).expect(400);
      expect(res.body).toMatchObject({ code: 'PROCESS_INVALID_TECHNICAL_REF' });
    }
    await userModel().updateOne({ _id: martin }, { $set: { status: 'inactive' } }).exec();
    expect((await patch(mariana(), p.id, { technicalRefIds: [martin] }).expect(400)).body).toMatchObject({ code: 'PROCESS_INVALID_TECHNICAL_REF' });
    await userModel().updateOne({ _id: martin }, { $set: { status: 'active' } }).exec();
  });

  it('should answer 400 PROCESS_TERMINAL_STATE on a closed process and mix refs with other fields', async () => {
    const carlos = await idOf('carlos@ibm.com');
    const p = await newProcess(mariana());
    expect((await patch(mariana(), p.id, { title: 'Mezcla', technicalRefIds: [carlos] }).expect(200)).body).toMatchObject({ title: 'Mezcla', technicalRefIds: [carlos] });
    await patch(mariana(), p.id, { status: 'closed' }).expect(200);
    expect((await patch(mariana(), p.id, { technicalRefIds: [] }).expect(400)).body).toMatchObject({ code: 'PROCESS_TERMINAL_STATE' });
  });

  it('should read a legacy document without technicalRefIds as []', async () => {
    const model = ctx().app.get<Model<ProcessDocument>>(getModelToken(ProcessModel.name));
    const now = new Date();
    const { insertedId } = await model.collection.insertOne({
      title: 'Viejo', clientName: 'C', ownerPmId: mariana().id, recruiterId: ana().id, status: 'open', candidateIds: [],
      createdBy: { id: mariana().id, email: mariana().email, role: 'pm' }, createdAt: now, updatedAt: now,
    });
    const detail = (await as(ctx(), ana(), 'get', `/processes/${insertedId.toString()}`).expect(200)).body as IProcessDetail;
    expect([detail.technicalRefIds, detail.technicalRefs]).toEqual([[], []]);
  });

  it('should omit a referent deleted after being assigned', async () => {
    const [martin, sofia] = [await idOf('martin.rivas@ibm.com'), await idOf('sofia.valenzuela@ibm.com')];
    const p = await newProcess(mariana());
    await patch(mariana(), p.id, { technicalRefIds: [martin, sofia] }).expect(200);
    await userModel().deleteOne({ _id: martin }).exec();
    const got = (await as(ctx(), ana(), 'get', `/processes/${p.id}`).expect(200)).body as IProcessDetail;
    expect(got.technicalRefs.map((r) => r.id)).toEqual([sofia]);
  });
});

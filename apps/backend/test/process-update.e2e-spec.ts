import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import type { IProcess, IProcessDetail } from '@ibm-talent-bridge/shared-types';
import { ProcessModel, type ProcessDocument } from '../src/capabilities/processes/infrastructure/adapters/process.schema';
import { as, createCandidate, OPPORTUNITY } from './support/processes-e2e.helpers';
import { useProcessCandidatesApp } from './support/process-candidates-e2e.helpers';

jest.setTimeout(30_000);

describe('PATCH /processes/:id', () => {
  const k = useProcessCandidatesApp('procupd1');
  const { ctx, mariana, ana, newProcess, stored, associate } = k;
  const patch = (user: Parameters<typeof as>[1], id: string, body: object): ReturnType<typeof as> => as(ctx(), user, 'patch', `/processes/${id}`).send(body);

  it('should create with status open by default', async () => {
    expect((await newProcess(mariana())).status).toBe('open');
  });

  it('should allow only the owner pm and the assigned recruiter; 401 without token and 403 for the rest', async () => {
    const p = await newProcess(mariana(), { recruiterId: ana().id });
    await patch(undefined, p.id, { title: 'X' }).expect(401);
    await patch(ctx().users.carlos, p.id, { title: 'X' }).expect(403);
    const foreign = await newProcess(mariana());
    await patch(ana(), foreign.id, { title: 'X' }).expect(403);
    const otherOwner = (await as(ctx(), ana(), 'post', '/processes').send({ title: 'T', clientName: 'C', ...OPPORTUNITY, ownerPmId: mariana().id }).expect(201)).body as IProcess;
    await patch(ana(), otherOwner.id, { title: 'Del recruiter' }).expect(200);
    expect(((await patch(mariana(), p.id, { title: 'Nuevo', clientName: 'Otro' }).expect(200)).body as IProcessDetail)).toMatchObject({ title: 'Nuevo', clientName: 'Otro' });
    expect(((await patch(ana(), p.id, { title: 'Por reclutador' }).expect(200)).body as IProcessDetail).title).toBe('Por reclutador');
  });

  it('should answer 403 to a PM that is not the owner (as a pm creator elsewhere) and 400 on invalid bodies', async () => {
    const p = await newProcess(mariana(), { recruiterId: ana().id });
    await patch(ana(), p.id, { hack: 1 }).expect(400);
    await patch(mariana(), p.id, { status: 'active' }).expect(400);
    await patch(mariana(), p.id, { title: '  ' }).expect(400);
    await patch(mariana(), 'not-an-id', { title: 'X' }).expect(400);
    await patch(mariana(), '507f1f77bcf86cd799439011', { title: 'X' }).expect(404);
  });

  it('should let only the owner pm change the recruiter, and only to a recruiter', async () => {
    const p = await newProcess(mariana(), { recruiterId: ana().id });
    await patch(ana(), p.id, { recruiterId: ana().id }).expect(403);
    await patch(mariana(), p.id, { recruiterId: ctx().users.carlos.id }).expect(400);
    await patch(mariana(), p.id, { recruiterId: mariana().id }).expect(400);
    expect(((await patch(mariana(), p.id, { recruiterId: ana().id }).expect(200)).body as IProcessDetail).recruiterId).toBe(ana().id);
  });

  it('should move freely between non terminal states and expose status on list and detail', async () => {
    const p = await newProcess(mariana(), { recruiterId: ana().id });
    for (const status of ['interviewing', 'in_progress', 'open', 'interviewing']) {
      expect(((await patch(ana(), p.id, { status }).expect(200)).body as IProcessDetail).status).toBe(status);
    }
    expect(((await as(ctx(), mariana(), 'get', `/processes/${p.id}`).expect(200)).body as IProcessDetail).status).toBe('interviewing');
    const list = (await as(ctx(), mariana(), 'get', '/processes').expect(200)).body as { data: Array<{ id: string; status: string }> };
    expect(list.data.find((row) => row.id === p.id)?.status).toBe('interviewing');
  });

  it('should treat a document without status as open', async () => {
    const p = await newProcess(mariana());
    const model = ctx().app.get<Model<ProcessDocument>>(getModelToken(ProcessModel.name));
    await model.collection.updateOne({ _id: new (model.base.Types.ObjectId)(p.id) }, { $unset: { status: '' } });
    expect(((await as(ctx(), mariana(), 'get', `/processes/${p.id}`).expect(200)).body as IProcessDetail).status).toBe('open');
    expect(((await patch(mariana(), p.id, { title: 'Legacy' }).expect(200)).body as IProcessDetail).status).toBe('open');
  });

  it('should keep candidates on closed, and answer PROCESS_TERMINAL_STATE to patch, add and remove', async () => {
    const p = await newProcess(mariana(), { recruiterId: ana().id });
    const c1 = await createCandidate(ctx(), ana(), 'Cierre Uno');
    const c2 = await createCandidate(ctx(), ana(), 'Cierre Dos');
    await associate(ana(), p.id, c1).expect(201);
    const closed = (await patch(ana(), p.id, { status: 'closed' }).expect(200)).body as IProcessDetail;
    expect(closed).toMatchObject({ status: 'closed', candidateIds: [c1] });
    expect((await stored(c1))?.processId).toBe(p.id);
    const code = { statusCode: 400, code: 'PROCESS_TERMINAL_STATE' };
    expect((await patch(mariana(), p.id, { title: 'X' }).expect(400)).body).toMatchObject(code);
    expect((await patch(mariana(), p.id, { status: 'open' }).expect(400)).body).toMatchObject(code);
    expect((await associate(mariana(), p.id, c2).expect(400)).body).toMatchObject(code);
    expect((await as(ctx(), mariana(), 'delete', `/processes/${p.id}/candidates/${c1}`).expect(400)).body).toMatchObject(code);
  });

  it('should release the candidates when cancelling and then reject further changes', async () => {
    const p = await newProcess(mariana(), { recruiterId: ana().id });
    const c1 = await createCandidate(ctx(), ana(), 'Cancel Uno');
    const c2 = await createCandidate(ctx(), ana(), 'Cancel Dos');
    await associate(mariana(), p.id, c1).expect(201);
    await associate(mariana(), p.id, c2).expect(201);
    const cancelled = (await patch(ana(), p.id, { status: 'cancelled' }).expect(200)).body as IProcessDetail;
    expect(cancelled).toMatchObject({ status: 'cancelled', candidateIds: [], candidates: [] });
    expect((await stored(c1))?.processId).toBeUndefined();
    expect((await stored(c2))?.processId).toBeUndefined();
    await patch(mariana(), p.id, { status: 'open' }).expect(400);
    const again = await newProcess(mariana());
    await associate(mariana(), again.id, c1).expect(201);
  });

  it('should answer CANDIDATE_ALREADY_ASSIGNED and PROCESS_CANDIDATE_LIMIT codes', async () => {
    const p = await newProcess(mariana());
    const c = await createCandidate(ctx(), ana(), 'Codigo Uno');
    await associate(mariana(), p.id, c).expect(201);
    const other = await newProcess(mariana());
    expect((await associate(mariana(), other.id, c).expect(409)).body).toMatchObject({ statusCode: 409, code: 'CANDIDATE_ALREADY_ASSIGNED' });
    for (let n = 0; n < 6; n += 1) await associate(mariana(), p.id, await createCandidate(ctx(), ana(), `Cod ${n}`)).expect(201);
    const extra = await createCandidate(ctx(), ana(), 'Cod Extra');
    expect((await associate(mariana(), p.id, extra).expect(400)).body).toMatchObject({ statusCode: 400, code: 'PROCESS_CANDIDATE_LIMIT' });
  });
});

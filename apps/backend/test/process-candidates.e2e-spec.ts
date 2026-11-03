import type { IProcessDetail, IProcessListItem, PaginatedResponse } from '@ibm-talent-bridge/shared-types';
import { as, createCandidate, OPPORTUNITY } from './support/processes-e2e.helpers';
import { useProcessCandidatesApp } from './support/process-candidates-e2e.helpers';

jest.setTimeout(30_000);

describe('Process candidates association', () => {
  const k = useProcessCandidatesApp('pcassoc1');
  const { ctx, mariana, ana, newProcess, stored, associate } = k;

  it('should associate an available candidate, set processId in Mongo and show it in the detail and list', async () => {
    const process = await newProcess(mariana(), { recruiterId: ana().id });
    const candidateId = await createCandidate(ctx(), ana(), 'Persona Uno');
    const body = (await associate(mariana(), process.id, candidateId).expect(201)).body as IProcessDetail;
    expect(body.candidates).toEqual([{ id: candidateId, fullName: 'Persona Uno', primaryRole: 'Backend' }]);
    expect((await stored(candidateId))?.processId).toBe(process.id);
    const detail = (await as(ctx(), ana(), 'get', `/processes/${process.id}`).expect(200)).body as IProcessDetail;
    expect(detail.candidateIds).toEqual([candidateId]);
    const list = (await as(ctx(), ana(), 'get', '/processes?limit=50').expect(200)).body as PaginatedResponse<IProcessListItem>;
    expect(list.data.find((item) => item.id === process.id)?.candidateCount).toBe(1);
  });


  it('should let the assigned recruiter associate and remove, freeing the candidate', async () => {
    const process = await newProcess(mariana(), { recruiterId: ana().id });
    const candidateId = await createCandidate(ctx(), mariana(), 'Persona Dos');
    await associate(ana(), process.id, candidateId).expect(201);
    const removed = (await as(ctx(), ana(), 'delete', `/processes/${process.id}/candidates/${candidateId}`).expect(200)).body as IProcessDetail;
    expect(removed.candidates).toEqual([]);
    expect((await stored(candidateId))?.processId).toBeUndefined();
    await as(ctx(), ana(), 'delete', `/processes/${process.id}/candidates/${candidateId}`).expect(404);
  });

});

describe('Process candidates conflicts', () => {
  const k = useProcessCandidatesApp('pcassoc2');
  const { ctx, mariana, ana, newProcess, associate } = k;

  it('should answer 409 for a candidate of another process or already in this one', async () => {
    const first = await newProcess(mariana());
    const second = await newProcess(mariana());
    const candidateId = await createCandidate(ctx(), ana(), 'Persona Tres');
    await associate(mariana(), first.id, candidateId).expect(201);
    await associate(mariana(), second.id, candidateId).expect(409);
    await associate(mariana(), first.id, candidateId).expect(409);
    const detail = (await as(ctx(), mariana(), 'get', `/processes/${first.id}`).expect(200)).body as IProcessDetail;
    expect(detail.candidateIds).toEqual([candidateId]);
  });


});

describe('Process candidates creation', () => {
  const k = useProcessCandidatesApp('pcassoc3');
  const { ctx, mariana, ana, newProcess, stored } = k;

  it('should create a process with candidateIds marking them, and validate before creating anything', async () => {
    const [x, y] = [await createCandidate(ctx(), ana(), 'Alta Uno'), await createCandidate(ctx(), ana(), 'Alta Dos')];
    const created = await newProcess(mariana(), { candidateIds: [x, y] });
    expect(created.candidateIds).toEqual([x, y]);
    expect((await stored(y))?.processId).toBe(created.id);
    const free = await createCandidate(ctx(), ana(), 'Alta Libre');
    const before = (await as(ctx(), mariana(), 'get', '/processes?limit=50').expect(200)).body as PaginatedResponse<IProcessListItem>;
    const post = (ids: string[]): ReturnType<typeof as> => as(ctx(), mariana(), 'post', '/processes').send({ title: 'T', clientName: 'C', ...OPPORTUNITY, candidateIds: ids });
    await post([free, x]).expect(409);
    await post([free, '507f1f77bcf86cd799439011']).expect(404);
    await post([free, free]).expect(400);
    const many = await Promise.all(Array.from({ length: 8 }, (_v, n) => createCandidate(ctx(), ana(), `Muchos ${n}`)));
    await post(many).expect(400);
    const after = (await as(ctx(), mariana(), 'get', '/processes?limit=50').expect(200)).body as PaginatedResponse<IProcessListItem>;
    expect(after.total).toBe(before.total);
    expect((await stored(free))?.processId).toBeUndefined();
  });

});

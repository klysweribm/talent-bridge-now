import type { ICandidate, IProcessDetail, PaginatedResponse } from '@ibm-talent-bridge/shared-types';
import { as, createCandidate } from './support/processes-e2e.helpers';
import { useProcessCandidatesApp } from './support/process-candidates-e2e.helpers';

jest.setTimeout(30_000);

describe('Process candidates reads', () => {
  const k = useProcessCandidatesApp('pcreads1');
  const { ctx, mariana, ana, newProcess, stored, associate } = k;

  it('should omit an orphan id from the detail without failing', async () => {
    const process = await newProcess(mariana());
    const candidateId = await createCandidate(ctx(), ana(), 'Persona Huerfana');
    await associate(mariana(), process.id, candidateId).expect(201);
    await k.candidates().deleteOne({ _id: candidateId }).exec();
    const detail = (await as(ctx(), mariana(), 'get', `/processes/${process.id}`).expect(200)).body as IProcessDetail;
    expect(detail.candidates).toEqual([]);
    expect(detail.candidateIds).toEqual([candidateId]);
  });


  it('should keep processId when the candidate is updated with PUT and reject processId in the body', async () => {
    const process = await newProcess(mariana());
    const email = `put.${Date.now()}@example.test`;
    const created = (await as(ctx(), ana(), 'post', '/candidates').send({ email, fullName: 'Persona Put' }).expect(201)).body as ICandidate;
    await associate(mariana(), process.id, created.id).expect(201);
    const updated = (await as(ctx(), ana(), 'put', `/candidates/${created.id}`).send({ email, fullName: 'Persona Put Nueva' }).expect(200)).body as ICandidate;
    expect(updated.processId).toBe(process.id);
    expect((await stored(created.id))?.processId).toBe(process.id);
    await as(ctx(), ana(), 'put', `/candidates/${created.id}`).send({ email, fullName: 'X', processId: 'otro' }).expect(400);
    await as(ctx(), ana(), 'post', '/candidates').send({ email: `n.${email}`, fullName: 'X', processId: 'otro' }).expect(400);
  });

});

describe('Available candidates', () => {
  const k = useProcessCandidatesApp('pcreads2');
  const { ctx, mariana, ana, newProcess, associate } = k;

  it('should list only available candidates, paginated, with 401/403 guards', async () => {
    const busy = await createCandidate(ctx(), ana(), 'Ocupado Listado');
    const free = await createCandidate(ctx(), ana(), 'Libre Listado');
    await associate(mariana(), (await newProcess(mariana())).id, busy).expect(201);
    const page = (await as(ctx(), ana(), 'get', '/candidates/available?limit=50').expect(200)).body as PaginatedResponse<Record<string, unknown>>;
    const ids = page.data.map((item) => item.id);
    expect(ids).toContain(free);
    expect(ids).not.toContain(busy);
    expect(Object.keys(page.data[0]).sort()).toEqual(['fullName', 'id', 'primaryRole']);
    expect((await as(ctx(), mariana(), 'get', '/candidates/available?limit=1').expect(200)).body).toMatchObject({ limit: 1 });
    await as(ctx(), ana(), 'get', '/candidates/available?limit=51').expect(400);
    await as(ctx(), undefined, 'get', '/candidates/available').expect(401);
    await as(ctx(), ctx().users.carlos, 'get', '/candidates/available').expect(403);
  });
});

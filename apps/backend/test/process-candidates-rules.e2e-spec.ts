import type { IProcessDetail } from '@ibm-talent-bridge/shared-types';
import { as, createCandidate } from './support/processes-e2e.helpers';
import { useProcessCandidatesApp } from './support/process-candidates-e2e.helpers';

jest.setTimeout(30_000);

describe('Process candidates authorization', () => {
  const k = useProcessCandidatesApp('pcrules1');
  const { ctx, mariana, ana, newProcess, stored, associate } = k;

  it('should answer 403 to a foreign recruiter even if they uploaded the candidate, and to a PM that is not the owner', async () => {
    const process = await newProcess(mariana(), { recruiterId: ana().id });
    const candidateId = await createCandidate(ctx(), ana(), 'Persona Cuatro');
    const foreignProcess = await newProcess(mariana());
    await associate(ana(), foreignProcess.id, candidateId).expect(403);
    expect((await stored(candidateId))?.processId).toBeUndefined();
    await associate(mariana(), process.id, candidateId).expect(201);
    await as(ctx(), ana(), 'delete', `/processes/${foreignProcess.id}/candidates/${candidateId}`).expect(403);
  });


  it('should let only the owner PM manage a process without recruiter', async () => {
    const process = await newProcess(mariana());
    expect(process.recruiterId).toBeNull();
    const candidateId = await createCandidate(ctx(), ana(), 'Persona Cinco');
    await associate(ana(), process.id, candidateId).expect(403);
    await associate(mariana(), process.id, candidateId).expect(201);
  });

});

describe('Process candidates input guards', () => {
  const k = useProcessCandidatesApp('pcrules2');
  const { ctx, mariana, ana, newProcess, associate } = k;

  it('should answer 401 without a token, 403 for technical_ref, 404 and 400 on bad ids', async () => {
    const process = await newProcess(mariana());
    const candidateId = await createCandidate(ctx(), ana(), 'Persona Seis');
    await associate(undefined, process.id, candidateId).expect(401);
    await associate(ctx().users.carlos, process.id, candidateId).expect(403);
    await as(ctx(), ctx().users.carlos, 'delete', `/processes/${process.id}/candidates/${candidateId}`).expect(403);
    await associate(mariana(), '507f1f77bcf86cd799439011', candidateId).expect(404);
    await associate(mariana(), process.id, '507f1f77bcf86cd799439011').expect(404);
    await associate(mariana(), process.id, 'not-an-id').expect(400);
    await associate(mariana(), process.id, undefined).expect(400);
  });

});

describe('Process candidates limit and race', () => {
  const k = useProcessCandidatesApp('pcrules3');
  const { ctx, mariana, ana, newProcess, stored, associate } = k;

  it('should answer 400 naming the limit when the process is full (max 7)', async () => {
    const process = await newProcess(mariana());
    for (let n = 0; n < 7; n += 1) await associate(mariana(), process.id, await createCandidate(ctx(), ana(), `Lleno ${n}`)).expect(201);
    const extra = await createCandidate(ctx(), ana(), 'Lleno Extra');
    const response = await associate(mariana(), process.id, extra).expect(400);
    expect(JSON.stringify(response.body)).toContain('7');
    expect((await stored(extra))?.processId).toBeUndefined();
  });


  it('should let only one of two simultaneous associations win the last slot', async () => {
    const process = await newProcess(mariana());
    for (let n = 0; n < 6; n += 1) await associate(mariana(), process.id, await createCandidate(ctx(), ana(), `Carrera ${n}`)).expect(201);
    const [a, b] = [await createCandidate(ctx(), ana(), 'Carrera A'), await createCandidate(ctx(), ana(), 'Carrera B')];
    const statuses = (await Promise.all([associate(mariana(), process.id, a), associate(mariana(), process.id, b)])).map((r) => r.status).sort();
    expect(statuses).toEqual([201, 400]);
    const detail = (await as(ctx(), mariana(), 'get', `/processes/${process.id}`).expect(200)).body as IProcessDetail;
    expect(detail.candidateIds).toHaveLength(7);
    const holders = (await Promise.all([a, b].map(stored))).filter((doc) => doc?.processId === process.id);
    expect(holders).toHaveLength(1);
  });

});

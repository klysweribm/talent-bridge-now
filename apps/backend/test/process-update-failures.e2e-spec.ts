import type { IProcessDetail } from '@ibm-talent-bridge/shared-types';
import { CandidateDirectoryAdapter } from '../src/capabilities/processes/infrastructure/adapters/candidate-directory.adapter';
import { as, createCandidate } from './support/processes-e2e.helpers';
import { useProcessCandidatesApp } from './support/process-candidates-e2e.helpers';

jest.setTimeout(30_000);

describe('PATCH /processes/:id failures', () => {
  const k = useProcessCandidatesApp('procupd2');
  const { ctx, mariana, ana, newProcess, stored, associate } = k;
  const patch = (user: Parameters<typeof as>[1], id: string, body: object): ReturnType<typeof as> => as(ctx(), user, 'patch', `/processes/${id}`).send(body);
  const detail = async (id: string): Promise<IProcessDetail> => (await as(ctx(), mariana(), 'get', `/processes/${id}`).expect(200)).body as IProcessDetail;

  it.each(['title', 'clientName', 'recruiterId', 'status'])('should answer 400 to null in %s and leave the process untouched', async (field) => {
    const p = await newProcess(mariana(), { recruiterId: ana().id });
    await patch(mariana(), p.id, { [field]: null }).expect(400);
    expect(await detail(p.id)).toMatchObject({ title: p.title, clientName: p.clientName, status: 'open', recruiterId: ana().id });
  });

  it('should answer 503 PROCESS_RELEASE_FAILED and keep the process active when releasing fails, then allow a retry', async () => {
    const p = await newProcess(mariana(), { recruiterId: ana().id });
    const c1 = await createCandidate(ctx(), ana(), 'Falla Uno');
    await associate(mariana(), p.id, c1).expect(201);
    const spy = jest.spyOn(CandidateDirectoryAdapter.prototype, 'release').mockRejectedValueOnce(new Error('mongo down'));
    try {
      expect((await patch(mariana(), p.id, { status: 'cancelled' }).expect(503)).body).toMatchObject({ statusCode: 503, code: 'PROCESS_RELEASE_FAILED' });
    } finally {
      spy.mockRestore();
    }
    expect(await detail(p.id)).toMatchObject({ status: 'open', candidateIds: [c1] });
    expect((await stored(c1))?.processId).toBe(p.id);
    await patch(mariana(), p.id, { status: 'cancelled' }).expect(200);
    expect((await stored(c1))?.processId).toBeUndefined();
  });
});

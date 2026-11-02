import type { IProcessDetail } from '@ibm-talent-bridge/shared-types';
import { as } from './support/processes-e2e.helpers';
import { useProcessCandidatesApp } from './support/process-candidates-e2e.helpers';

jest.setTimeout(30_000);

describe('PATCH /processes/:id opportunity fields', () => {
  const k = useProcessCandidatesApp('procupd3');
  const { ctx, mariana, ana, newProcess } = k;
  const patch = (user: Parameters<typeof as>[1], id: string, body: object): ReturnType<typeof as> => as(ctx(), user, 'patch', `/processes/${id}`).send(body);

  it.each(['opportunityRole', 'skills', 'roleDescription', 'band'])('should answer 400 to null in %s', async (field) => {
    const p = await newProcess(mariana(), { recruiterId: ana().id });
    await patch(mariana(), p.id, { [field]: null }).expect(400);
  });

  it('should answer 400 to an invalid band or skills and 400 PROCESS_TERMINAL_STATE on a closed process', async () => {
    const p = await newProcess(mariana(), { recruiterId: ana().id });
    await patch(mariana(), p.id, { band: 5 }).expect(400);
    await patch(mariana(), p.id, { skills: ['a', 'A'] }).expect(200);
    await patch(mariana(), p.id, { status: 'closed' }).expect(200);
    expect((await patch(mariana(), p.id, { band: 7 }).expect(400)).body).toMatchObject({ code: 'PROCESS_TERMINAL_STATE' });
  });

  it('should patch the opportunity fields partially for the owner pm and the assigned recruiter', async () => {
    const p = await newProcess(mariana(), { recruiterId: ana().id });
    const first = (await patch(mariana(), p.id, { band: 10, skills: [' Go ', 'go', 'Rust'] }).expect(200)).body as IProcessDetail;
    expect(first).toMatchObject({ band: 10, skills: ['Go', 'Rust'], opportunityRole: p.opportunityRole, roleDescription: p.roleDescription });
    expect((await patch(ana(), p.id, { roleDescription: 'Nueva' }).expect(200)).body).toMatchObject({ roleDescription: 'Nueva', band: 10 });
  });
});

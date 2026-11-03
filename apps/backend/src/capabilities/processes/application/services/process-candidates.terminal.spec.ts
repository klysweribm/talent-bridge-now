import { ConflictException, ForbiddenException, type HttpException } from '@nestjs/common';
import { OTHER_REC } from '../../testing/process-fakes';
import { actorOf, assigned, owner, setup } from '../../testing/process-candidates.setup';

const bodyOf = (error: unknown): unknown => (error as HttpException).getResponse();

describe('ProcessCandidatesService terminal state and stable codes', () => {
  it.each(['closed', 'cancelled'] as const)('should reject add and remove with PROCESS_TERMINAL_STATE when %s', async (status) => {
    const { fakes, service } = setup();
    fakes.addProcess({ status, candidateIds: ['c-9'] });
    const added: unknown = await service.associate('p-0', 'c-1', owner).catch((e: unknown) => e);
    expect(bodyOf(added)).toMatchObject({ statusCode: 400, code: 'PROCESS_TERMINAL_STATE' });
    const removed: unknown = await service.dissociate('p-0', 'c-9', assigned).catch((e: unknown) => e);
    expect(bodyOf(removed)).toMatchObject({ statusCode: 400, code: 'PROCESS_TERMINAL_STATE' });
  });

  it('should answer 403 before the terminal check for a stranger', async () => {
    const { fakes, service } = setup();
    fakes.addProcess({ status: 'closed' });
    await expect(service.associate('p-0', 'c-1', actorOf(OTHER_REC, 'recruiter'))).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should answer CANDIDATE_ALREADY_ASSIGNED and PROCESS_CANDIDATE_LIMIT', async () => {
    const { fakes, service } = setup();
    fakes.addCandidate('c-2', 'other');
    const taken: unknown = await service.associate('p-0', 'c-2', owner).catch((e: unknown) => e);
    expect(taken).toBeInstanceOf(ConflictException);
    expect(bodyOf(taken)).toMatchObject({ statusCode: 409, code: 'CANDIDATE_ALREADY_ASSIGNED' });
    fakes.addProcess({ candidateIds: ['a', 'b', 'c'] });
    const full: unknown = await service.associate('p-0', 'c-1', owner).catch((e: unknown) => e);
    expect(bodyOf(full)).toMatchObject({ statusCode: 400, code: 'PROCESS_CANDIDATE_LIMIT' });
  });
});

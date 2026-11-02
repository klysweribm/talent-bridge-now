import { httpClient } from '@shared/infrastructure/httpClient';
import { HttpError } from '@shared/infrastructure/httpError';
import { PROCESS_ACTION_ERRORS, PROCESS_ERROR_CODES } from '../config/processActions.constants';
import { addProcessCandidate, removeProcessCandidate, updateProcess } from './processUpdate.infra';
import { ProcessActionError } from './processUpdate.translate';

vi.mock('@shared/infrastructure/httpClient', () => ({ httpClient: { patch: vi.fn(), post: vi.fn(), delete: vi.fn() } }));

const { patch, post, delete: del } = vi.mocked(httpClient);

describe('processUpdate.infra', () => {
  beforeEach(() => { for (const fn of [patch, post, del]) { fn.mockReset(); fn.mockResolvedValue({}); } });

  it('should PATCH /processes/:id with the request', async () => {
    await updateProcess('p 1', { title: 'Nuevo', status: 'closed' });
    expect(patch).toHaveBeenCalledWith('/processes/p%201', { title: 'Nuevo', status: 'closed' });
  });

  it('should POST /processes/:id/candidates with the candidateId', async () => {
    await addProcessCandidate('p1', 'c1');
    expect(post).toHaveBeenCalledWith('/processes/p1/candidates', { candidateId: 'c1' });
  });

  it('should DELETE /processes/:id/candidates/:candidateId', async () => {
    await removeProcessCandidate('p1', 'c1');
    expect(del).toHaveBeenCalledWith('/processes/p1/candidates/c1');
  });

  it('should translate failures by code into a ProcessActionError', async () => {
    patch.mockRejectedValue(new HttpError(503, 'x', { code: PROCESS_ERROR_CODES.releaseFailed }));
    await expect(updateProcess('p1', { status: 'cancelled' })).rejects.toThrow(PROCESS_ACTION_ERRORS.releaseFailed);
    post.mockRejectedValue(new HttpError(409, 'x', { code: PROCESS_ERROR_CODES.candidateAlreadyAssigned }));
    await expect(addProcessCandidate('p1', 'c1')).rejects.toBeInstanceOf(ProcessActionError);
    del.mockRejectedValue(new HttpError(403, 'x'));
    await expect(removeProcessCandidate('p1', 'c1')).rejects.toThrow(PROCESS_ACTION_ERRORS.forbidden);
  });
});

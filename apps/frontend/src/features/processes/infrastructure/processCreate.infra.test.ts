import { httpClient } from '@shared/infrastructure/httpClient';
import { HttpError } from '@shared/infrastructure/httpError';
import { createProcess, fetchAvailableCandidates, fetchProcessLimits, fetchUserOptions } from './processCreate.infra';
import {
  CandidateAlreadyAssignedError, CandidateLimitExceededError, CandidateNotFoundForProcessError, ProcessServiceUnavailableError,
} from './processCreate.errors';

vi.mock('@shared/infrastructure/httpClient', () => ({ httpClient: { get: vi.fn(), post: vi.fn() } }));

const get = vi.mocked(httpClient.get);
const post = vi.mocked(httpClient.post);
const REQUEST = { title: 'T', clientName: 'C' };

describe('processCreate.infra', () => {
  beforeEach(() => { get.mockReset(); post.mockReset(); get.mockResolvedValue({}); post.mockResolvedValue({}); });

  it('should POST /processes with the request', async () => {
    await createProcess(REQUEST);
    expect(post).toHaveBeenCalledWith('/processes', REQUEST);
  });

  it('should GET /candidates/available without query when no params', async () => {
    await fetchAvailableCandidates({});
    expect(get).toHaveBeenCalledWith('/candidates/available');
  });

  it('should GET /candidates/available with page and limit', async () => {
    await fetchAvailableCandidates({ page: 2, limit: 20 });
    expect(get).toHaveBeenCalledWith('/candidates/available?page=2&limit=20');
  });

  it('should GET /users with the role and pagination', async () => {
    await fetchUserOptions('pm', { page: 1, limit: 50 });
    expect(get).toHaveBeenCalledWith('/users?role=pm&page=1&limit=50');
  });

  it('should GET /users with only the role when no pagination', async () => {
    await fetchUserOptions('recruiter');
    expect(get).toHaveBeenCalledWith('/users?role=recruiter');
  });

  it('should GET /processes/limits', async () => {
    await fetchProcessLimits();
    expect(get).toHaveBeenCalledWith('/processes/limits');
  });

  it.each([
    [409, 'The candidate already belongs to a process', 'CANDIDATE_ALREADY_ASSIGNED', CandidateAlreadyAssignedError],
    [400, 'A process can have at most 5 candidates', 'PROCESS_CANDIDATE_LIMIT', CandidateLimitExceededError],
    [404, 'Candidate not found', undefined, CandidateNotFoundForProcessError],
    [503, 'Could not associate', undefined, ProcessServiceUnavailableError],
  ])('should translate a %i into its typed error', async (status, message, code, errorClass) => {
    post.mockRejectedValue(new HttpError(status, message, code ? { code } : null));
    await expect(createProcess(REQUEST)).rejects.toBeInstanceOf(errorClass);
  });

  it('should translate by code even if the server text changes language', async () => {
    post.mockRejectedValue(new HttpError(400, 'Un proceso admite como máximo 5 candidatos', { code: 'PROCESS_CANDIDATE_LIMIT' }));
    await expect(createProcess(REQUEST)).rejects.toBeInstanceOf(CandidateLimitExceededError);
  });

  it('should not treat an uncoded 400 whose text mentions the limit as the limit error', async () => {
    post.mockRejectedValue(new HttpError(400, 'A process can have at most 5 candidates'));
    await expect(createProcess(REQUEST)).rejects.not.toBeInstanceOf(CandidateLimitExceededError);
  });

  it('should keep the server message in the limit error', async () => {
    post.mockRejectedValue(new HttpError(400, 'A process can have at most 5 candidates', { code: 'PROCESS_CANDIDATE_LIMIT' }));
    await expect(createProcess(REQUEST)).rejects.toMatchObject({ serverMessage: 'A process can have at most 5 candidates' });
  });

  it('should propagate other 400s and unknown errors untouched', async () => {
    const validation = new HttpError(400, 'title must be shorter');
    post.mockRejectedValue(validation);
    await expect(createProcess(REQUEST)).rejects.toBe(validation);
    const network = new Error('boom');
    post.mockRejectedValue(network);
    await expect(createProcess(REQUEST)).rejects.toBe(network);
  });
});

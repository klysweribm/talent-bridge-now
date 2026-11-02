import { httpClient } from '@shared/infrastructure/httpClient';
import { fetchCandidateList } from './candidateList.infra';

vi.mock('@shared/infrastructure/httpClient', () => ({ httpClient: { get: vi.fn() } }));

const get = vi.mocked(httpClient.get);

describe('candidateList.infra', () => {
  beforeEach(() => { get.mockReset(); get.mockResolvedValue({}); });

  it('should GET /candidates without query string when no params', async () => {
    await fetchCandidateList({});
    expect(get).toHaveBeenCalledWith('/candidates');
  });

  it('should send only the params that are present', async () => {
    await fetchCandidateList({ page: 2, assignment: 'available' });
    expect(get).toHaveBeenCalledWith('/candidates?page=2&assignment=available');
  });

  it('should send page, limit and assignment together', async () => {
    await fetchCandidateList({ page: 3, limit: 10, assignment: 'assigned' });
    expect(get).toHaveBeenCalledWith('/candidates?page=3&limit=10&assignment=assigned');
  });
});

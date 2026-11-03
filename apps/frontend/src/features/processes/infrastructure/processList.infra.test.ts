import { httpClient } from '@shared/infrastructure/httpClient';
import { fetchProcessDetail, fetchProcessList } from './processList.infra';

vi.mock('@shared/infrastructure/httpClient', () => ({ httpClient: { get: vi.fn() } }));

const get = vi.mocked(httpClient.get);

describe('processList.infra', () => {
  beforeEach(() => { get.mockReset(); get.mockResolvedValue({}); });

  it('should GET /processes without query string when no params', async () => {
    await fetchProcessList({});
    expect(get).toHaveBeenCalledWith('/processes');
  });

  it('should GET /processes with page and limit', async () => {
    await fetchProcessList({ page: 2, limit: 10 });
    expect(get).toHaveBeenCalledWith('/processes?page=2&limit=10');
  });

  it('should send q only when present, encoded', async () => {
    await fetchProcessList({ q: 'banco andino' });
    expect(get).toHaveBeenLastCalledWith('/processes?q=banco+andino');
    await fetchProcessList({ page: 2, q: '' });
    expect(get).toHaveBeenLastCalledWith('/processes?page=2');
  });

  it('should GET /processes/:id encoding the path segment', async () => {
    await fetchProcessDetail('a/b 1');
    expect(get).toHaveBeenCalledWith('/processes/a%2Fb%201');
  });
});

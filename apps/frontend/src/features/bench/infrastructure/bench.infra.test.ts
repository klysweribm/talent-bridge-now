import { httpClient } from '@shared/infrastructure/httpClient';
import { fetchBench, fetchBenchResource, fetchBenchSkills } from './bench.infra';

vi.mock('@shared/infrastructure/httpClient', () => ({ httpClient: { get: vi.fn() } }));

const get = vi.mocked(httpClient.get);

describe('bench.infra', () => {
  beforeEach(() => { get.mockReset(); get.mockResolvedValue([]); });

  it('should GET /bench without query string when there are no filters', async () => {
    await fetchBench({});
    expect(get).toHaveBeenCalledWith('/bench');
  });

  it('should GET /bench with the encoded filters', async () => {
    await fetchBench({ skills: ['C#'], page: 2 });
    expect(get).toHaveBeenCalledWith('/bench?skills=C%23&page=2');
  });

  it('should GET /bench/skills', async () => {
    await fetchBenchSkills();
    expect(get).toHaveBeenCalledWith('/bench/skills');
  });

  it('should GET /bench/:code encoding the path segment', async () => {
    await fetchBenchResource('BN 0/1');
    expect(get).toHaveBeenCalledWith('/bench/BN%200%2F1');
  });
});

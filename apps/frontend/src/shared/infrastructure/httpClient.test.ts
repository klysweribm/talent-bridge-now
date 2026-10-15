import { httpClient } from './httpClient';
import { HttpError } from './httpError';
import { useAuthStore } from '@features/auth/store/auth.store';

function mockFetchOnce(status: number, body: unknown): void {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(body === undefined ? '' : JSON.stringify(body)),
  }));
}

describe('httpClient', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it('should resolve with the parsed JSON body on a successful GET', async () => {
    mockFetchOnce(200, { id: '1' });
    const result = await httpClient.get<{ id: string }>('/processes/1');
    expect(result).toEqual({ id: '1' });
  });

  it('should send the base URL from env and the JSON content type', async () => {
    mockFetchOnce(200, { ok: true });
    await httpClient.get('/processes');
    const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/v1/processes');
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('should attach a Bearer token from the auth store when present', async () => {
    useAuthStore.getState().setAuth(
      { id: '1', name: 'Ana', email: 'ana@ibm.com', role: 'recruiter' },
      'jwt-token-123',
    );
    mockFetchOnce(200, {});
    await httpClient.get('/processes');
    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer jwt-token-123');
  });

  it('should not attach an Authorization header when there is no token', async () => {
    mockFetchOnce(200, {});
    await httpClient.get('/processes');
    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it('should send the JSON-stringified body on POST', async () => {
    mockFetchOnce(201, { id: '2' });
    await httpClient.post('/processes', { title: 'New process' });
    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(init.body).toBe(JSON.stringify({ title: 'New process' }));
  });

  it('should reject with a typed HttpError carrying the server message on a 4xx/5xx response', async () => {
    mockFetchOnce(404, { message: 'Process not found' });
    await expect(httpClient.get('/processes/missing')).rejects.toMatchObject({
      name: 'HttpError',
      status: 404,
      message: 'Process not found',
    });
  });

  it('should reject with a typed HttpError when the response has no error body', async () => {
    mockFetchOnce(500, undefined);
    await expect(httpClient.get('/processes')).rejects.toBeInstanceOf(HttpError);
  });

  it('should reject with a typed HttpError when fetch itself throws (network failure)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network down')));
    await expect(httpClient.get('/processes')).rejects.toMatchObject({
      name: 'HttpError',
      message: 'Network down',
    });
  });
});

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

interface IDeferredFetch {
  readonly respond: (status: number, body: unknown) => void;
}

// Variante controlable: fetch queda pendiente hasta que el test lo resuelve a mano.
function mockFetchDeferred(): IDeferredFetch {
  let resolveFetch: (value: unknown) => void = () => undefined;
  vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise((resolve) => { resolveFetch = resolve; })));
  return {
    respond: (status, body) => resolveFetch({
      ok: status >= 200 && status < 300,
      status,
      text: () => Promise.resolve(JSON.stringify(body)),
    }),
  };
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

  describe('401 handling', () => {
    const SESSION_USER = { id: '1', name: 'Ana', email: 'ana@ibm.com', role: 'recruiter' as const };

    it('should clear the session and still reject with HttpError when a 401 arrives with an active session', async () => {
      useAuthStore.getState().setAuth(SESSION_USER, 'expired-token');
      mockFetchOnce(401, { message: 'Unauthorized' });

      await expect(httpClient.get('/processes')).rejects.toMatchObject({ status: 401 });

      expect(useAuthStore.getState().token).toBeNull();
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('should leave the empty session untouched when a 401 arrives without a session (e.g. unknown login email)', async () => {
      mockFetchOnce(401, { message: 'Usuario no provisionado' });

      await expect(httpClient.post('/auth/dev-login', { email: 'x@ibm.com' })).rejects.toMatchObject({
        status: 401,
        message: 'Usuario no provisionado',
      });
    });

    it('should keep the new session and still reject with 401 when a late 401 belongs to a previous token', async () => {
      useAuthStore.getState().setAuth(SESSION_USER, 'token-A');
      const deferred = mockFetchDeferred();
      const pending = httpClient.get('/processes');
      const assertion = expect(pending).rejects.toMatchObject({ status: 401 });

      useAuthStore.getState().setAuth(SESSION_USER, 'token-B');
      deferred.respond(401, { message: 'Unauthorized' });
      await assertion;

      expect(useAuthStore.getState().token).toBe('token-B');
      expect(useAuthStore.getState().user).toEqual(SESSION_USER);
    });

    it('should clear the session when the 401 belongs to the token that is still current', async () => {
      useAuthStore.getState().setAuth(SESSION_USER, 'token-A');
      const deferred = mockFetchDeferred();
      const pending = httpClient.get('/processes');
      const assertion = expect(pending).rejects.toMatchObject({ status: 401 });

      deferred.respond(401, { message: 'Unauthorized' });
      await assertion;

      expect(useAuthStore.getState().token).toBeNull();
    });

    it('should end with a cleared session and no exception when two concurrent requests get a 401 for the same token', async () => {
      useAuthStore.getState().setAuth(SESSION_USER, 'token-A');
      mockFetchOnce(401, { message: 'Unauthorized' });

      const results = await Promise.allSettled([httpClient.get('/a'), httpClient.get('/b')]);

      expect(results.map((r) => r.status)).toEqual(['rejected', 'rejected']);
      expect(results.every((r) => r.status === 'rejected' && (r.reason as HttpError).status === 401)).toBe(true);
      expect(useAuthStore.getState().token).toBeNull();
    });

    it.each([[403], [404], [500]])('should keep the session when the response is %i', async (status) => {
      useAuthStore.getState().setAuth(SESSION_USER, 'valid-token');
      mockFetchOnce(status, { message: 'nope' });

      await expect(httpClient.get('/processes')).rejects.toMatchObject({ status });

      expect(useAuthStore.getState().token).toBe('valid-token');
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

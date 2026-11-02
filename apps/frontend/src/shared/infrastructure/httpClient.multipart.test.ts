import type { Mock } from 'vitest';
import { httpClient } from './httpClient';
import { HttpError } from './httpError';

function stubFetch(status: number, body: unknown): Mock {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(JSON.stringify(body)),
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('httpClient multipart and error body', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('should send FormData as-is without a JSON content type so the browser sets the boundary', async () => {
    const fetchMock = stubFetch(200, { ok: true });
    const form = new FormData();
    form.append('mode', 'ica');
    await httpClient.post('/x', form);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.body).toBe(form);
    expect(init.headers).not.toHaveProperty('Content-Type');
  });

  it('should expose the parsed error body on HttpError', async () => {
    stubFetch(503, { reason: 'UNREACHABLE' });
    const error = await httpClient.post('/x', {}).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(HttpError);
    expect((error as HttpError).body).toEqual({ reason: 'UNREACHABLE' });
  });
});

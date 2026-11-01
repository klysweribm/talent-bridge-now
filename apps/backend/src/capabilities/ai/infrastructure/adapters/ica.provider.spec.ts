import { Logger } from '@nestjs/common';
import type { TAiConfig } from '../../domain/interfaces/ai-config.interface';
import { IcaProvider } from './ica.provider';

const KEY = 'test-key-not-real';
const URL_BASE = 'http://ica.invalid/v1';
const CONFIG: TAiConfig = {
  enabled: true, provider: 'ica', model: 'cfg-model', maxTokens: 256, callTimeoutMs: 1000, totalTimeoutMs: 5000,
  retry: { maxAttempts: 3, baseMs: 1, maxMs: 2 }, ica: { apiUrl: URL_BASE, apiKey: KEY },
};
const MESSAGES = [{ role: 'system', content: 'S' }, { role: 'user', content: 'U' }] as const;
const OK_BODY = { model: 'real', choices: [{ message: { content: 'hola' }, finish_reason: 'stop' }], usage: { prompt_tokens: 1, completion_tokens: 2 } };
const json = (body: unknown, status = 200): Response => new Response(JSON.stringify(body), { status });
const text = (body: string, status: number): Response => new Response(body, { status });

let fetchSpy: jest.SpiedFunction<typeof fetch>;
let logged: unknown[][];

beforeEach(() => {
  fetchSpy = jest.spyOn(globalThis, 'fetch');
  logged = [];
  for (const level of ['log', 'warn', 'error', 'debug', 'verbose'] as const) {
    jest.spyOn(Logger.prototype, level).mockImplementation((...args: unknown[]) => { logged.push(args); });
  }
});
afterEach(() => jest.restoreAllMocks());

const sentBody = (call = 0): Record<string, unknown> => JSON.parse(fetchSpy.mock.calls[call][1]?.body as string) as Record<string, unknown>;

describe('IcaProvider.complete request', () => {
  it('should POST the exact body with the bearer header and a signal', async () => {
    fetchSpy.mockResolvedValue(json(OK_BODY));

    await new IcaProvider(CONFIG).complete({ messages: MESSAGES, maxTokens: 99 });

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe(`${URL_BASE}/chat-models/chat/completions`);
    expect(init?.method).toBe('POST');
    expect(init?.headers).toMatchObject({ Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' });
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    expect(sentBody()).toEqual({ model: 'cfg-model', messages: MESSAGES, max_tokens: 99 });
  });

});

describe('IcaProvider.complete json mode', () => {
  it('should honour a model override and request json_object in json mode', async () => {
    fetchSpy.mockResolvedValue(json(OK_BODY));

    await new IcaProvider(CONFIG).complete({ messages: MESSAGES, maxTokens: 9, jsonMode: true, model: 'other' });

    expect(sentBody()).toMatchObject({ model: 'other', response_format: { type: 'json_object' } });
    expect(sentBody()).not.toHaveProperty('temperature');
  });

  it('should return the mapped completion', async () => {
    fetchSpy.mockResolvedValue(json(OK_BODY));

    await expect(new IcaProvider(CONFIG).complete({ messages: MESSAGES, maxTokens: 9 })).resolves.toEqual({
      content: 'hola', finishReason: 'stop', model: 'real', usage: { promptTokens: 1, completionTokens: 2 },
    });
  });

  it('should retry once without json mode when ICA rejects response_format', async () => {
    fetchSpy
      .mockResolvedValueOnce(text('litellm.UnsupportedParamsError: response_format not supported', 400))
      .mockResolvedValueOnce(json(OK_BODY));

    await new IcaProvider(CONFIG).complete({ messages: MESSAGES, maxTokens: 9, jsonMode: true });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(sentBody(0)).toHaveProperty('response_format');
    expect(sentBody(1)).not.toHaveProperty('response_format');
  });

  it('should not call fetch when there is no key', async () => {
    const provider = new IcaProvider({ enabled: false });

    await expect(provider.complete({ messages: MESSAGES, maxTokens: 9 })).rejects.toMatchObject({ kind: 'NOT_CONFIGURED' });
    await expect(provider.listModels()).rejects.toMatchObject({ kind: 'NOT_CONFIGURED' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('IcaProvider.complete errors', () => {
  it.each([
    [400, '{"error":"Invalid icaKey"}', 'UNAUTHORIZED', 1],
    [401, 'no', 'UNAUTHORIZED', 1],
    [403, 'no', 'UNAUTHORIZED', 1],
    [400, '{"detail":"Model not found"}', 'MODEL_NOT_FOUND', 1],
    [400, 'UnsupportedParamsError: temperature', 'MODEL_NOT_FOUND', 1],
    [429, 'slow', 'RATE_LIMITED', 3],
    [503, 'down', 'UNREACHABLE', 3],
    [500, 'down', 'UNREACHABLE', 3],
  ])('should map %s %j to %s after %s call(s)', async (status, body, kind, calls) => {
    fetchSpy.mockImplementation(() => Promise.resolve(text(body, status)));

    await expect(new IcaProvider(CONFIG).complete({ messages: MESSAGES, maxTokens: 9 })).rejects.toMatchObject({ kind });
    expect(fetchSpy).toHaveBeenCalledTimes(calls);
  });

});

describe('IcaProvider.complete retries, timeouts and secrecy', () => {
  it('should retry a transient 503 and then succeed', async () => {
    fetchSpy.mockResolvedValueOnce(text('x', 503)).mockResolvedValueOnce(json(OK_BODY));

    await expect(new IcaProvider(CONFIG).complete({ messages: MESSAGES, maxTokens: 9 })).resolves.toMatchObject({ content: 'hola' });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('should map network TypeError to UNREACHABLE after retrying', async () => {
    fetchSpy.mockRejectedValue(new TypeError('fetch failed'));

    await expect(new IcaProvider(CONFIG).complete({ messages: MESSAGES, maxTokens: 9 })).rejects.toMatchObject({ kind: 'UNREACHABLE' });
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });

});

describe('IcaProvider.complete timeouts and secrecy', () => {
  it('should map the per-call timeout to TIMEOUT without retrying', async () => {
    fetchSpy.mockImplementation((_url, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(init.signal?.reason));
    }));

    await expect(new IcaProvider({ ...CONFIG, callTimeoutMs: 20 } as TAiConfig).complete({ messages: MESSAGES, maxTokens: 9 }))
      .rejects.toMatchObject({ kind: 'TIMEOUT' });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('should map an already expired total budget to TIMEOUT', async () => {
    fetchSpy.mockImplementation((_url, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(init.signal?.reason));
    }));

    await expect(new IcaProvider(CONFIG).complete({ messages: MESSAGES, maxTokens: 9, signal: AbortSignal.abort() }))
      .rejects.toMatchObject({ kind: 'TIMEOUT' });
  });

  it('should cut the retry wait short when the total budget ends', async () => {
    fetchSpy.mockImplementation(() => Promise.resolve(text('x', 503)));
    const slow = { ...CONFIG, retry: { maxAttempts: 5, baseMs: 60_000, maxMs: 60_000 } } as TAiConfig;
    const started = Date.now();

    await expect(new IcaProvider(slow).complete({ messages: MESSAGES, maxTokens: 9, signal: AbortSignal.timeout(50) }))
      .rejects.toMatchObject({ kind: 'TIMEOUT' });
    expect(Date.now() - started).toBeLessThan(2000);
  });

  it('should throw INVALID_OUTPUT when a 200 has no content', async () => {
    fetchSpy.mockResolvedValue(json({ choices: [] }));

    await expect(new IcaProvider(CONFIG).complete({ messages: MESSAGES, maxTokens: 9 })).rejects.toMatchObject({ kind: 'INVALID_OUTPUT' });
  });

  it('should never put the key in logs or error messages', async () => {
    fetchSpy.mockImplementation(() => Promise.resolve(text(`{"error":"Invalid icaKey ${KEY}"}`, 400)));
    const error = await new IcaProvider(CONFIG).complete({ messages: MESSAGES, maxTokens: 9 }).catch((e: Error) => e);
    fetchSpy.mockRejectedValue(new TypeError('fetch failed'));
    const error2 = await new IcaProvider(CONFIG).complete({ messages: MESSAGES, maxTokens: 9 }).catch((e: Error) => e);

    expect(JSON.stringify([logged, (error as Error).message, (error2 as Error).message])).not.toContain(KEY);
  });
});

describe('IcaProvider.listModels', () => {
  it('should GET the models with the bearer header and return ids', async () => {
    fetchSpy.mockResolvedValue(json({ data: [{ id: 'a' }, { id: 'cfg-model' }] }));

    await expect(new IcaProvider(CONFIG).listModels()).resolves.toEqual(['a', 'cfg-model']);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe(`${URL_BASE}/chat-models/models`);
    expect(init?.headers).toMatchObject({ Authorization: `Bearer ${KEY}` });
  });

  it('should map a rejected key to UNAUTHORIZED without retrying', async () => {
    fetchSpy.mockResolvedValue(text('{"error":"Invalid icaKey"}', 400));

    await expect(new IcaProvider(CONFIG).listModels()).rejects.toMatchObject({ kind: 'UNAUTHORIZED' });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('should map a network failure to UNREACHABLE', async () => {
    fetchSpy.mockRejectedValue(new TypeError('fetch failed'));

    await expect(new IcaProvider(CONFIG).listModels()).rejects.toMatchObject({ kind: 'UNREACHABLE' });
  });
});

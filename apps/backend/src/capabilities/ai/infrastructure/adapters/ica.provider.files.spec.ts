import { Logger } from '@nestjs/common';
import type { TAiConfig } from '../../domain/interfaces/ai-config.interface';
import type { IAiFileUpload } from '../../domain/interfaces/ai-completion.interface';
import { flowStorage, type IFlowContext } from '../../../../shared/observability/flow-context';
import { IcaProvider } from './ica.provider';

const KEY = 'test-key-not-real';
const URL_BASE = 'http://ica.invalid/v1';
const CONFIG: TAiConfig = {
  enabled: true, provider: 'ica', model: 'cfg-model', maxTokens: 256, callTimeoutMs: 1000, totalTimeoutMs: 5000,
  retry: { maxAttempts: 1, baseMs: 1, maxMs: 1 }, ica: { apiUrl: URL_BASE, apiKey: KEY },
};
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const FILE: IAiFileUpload = { filename: 'cv.docx', mimeType: DOCX_MIME, data: new Uint8Array([0x50, 0x4b, 0x03, 0x04]) };
const json = (body: unknown, status = 200): Response => new Response(JSON.stringify(body), { status });
const raw = (body: string, status = 200): Response => new Response(body, { status });
const pending = (): Response => json({ id: 'f-1', data: { status: 'pending' } });
const completed = (content = 'texto'): Response => json({ id: 'f-1', data: { status: 'completed', content } });

let fetchSpy: jest.SpiedFunction<typeof fetch>;
let logged: unknown[][];

beforeEach(() => {
  fetchSpy = jest.spyOn(globalThis, 'fetch');
  logged = [];
  for (const level of ['log', 'warn', 'error', 'debug', 'verbose'] as const) {
    jest.spyOn(Logger.prototype, level).mockImplementation((...args: unknown[]) => { logged.push(args); });
  }
});
afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks(); });

describe('IcaProvider.uploadFile', () => {
  it('should POST multipart with field "file", the explicit MIME and the bearer header, and return the id', async () => {
    fetchSpy.mockResolvedValue(pending());

    const id = await new IcaProvider(CONFIG).uploadFile(FILE);

    const [url, init] = fetchSpy.mock.calls[0];
    expect(id).toBe('f-1');
    expect(url).toBe(`${URL_BASE}/files`);
    expect(init?.method).toBe('POST');
    expect(init?.headers).toMatchObject({ Authorization: `Bearer ${KEY}` });
    expect(init?.headers).not.toHaveProperty('Content-Type');
    const part = (init?.body as FormData).get('file') as File;
    expect(part.type).toBe(DOCX_MIME);
    expect(part.size).toBe(4);
  });

  it('should classify an ICA 400 invalid key as UNAUTHORIZED', async () => {
    fetchSpy.mockResolvedValue(raw('{"error":"Invalid icaKey"}', 400));

    await expect(new IcaProvider(CONFIG).uploadFile(FILE)).rejects.toMatchObject({ kind: 'UNAUTHORIZED' });
  });

  it('should fail with INVALID_OUTPUT when the response has no file id', async () => {
    fetchSpy.mockResolvedValue(json({ data: {} }));

    await expect(new IcaProvider(CONFIG).uploadFile(FILE)).rejects.toMatchObject({ kind: 'INVALID_OUTPUT' });
  });

  it('should fail with NOT_CONFIGURED when AI is disabled', async () => {
    await expect(new IcaProvider({ enabled: false }).uploadFile(FILE)).rejects.toMatchObject({ kind: 'NOT_CONFIGURED' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('IcaProvider.waitForFile', () => {
  it('should poll with backoff until the file is completed and return its text', async () => {
    jest.useFakeTimers();
    fetchSpy.mockResolvedValueOnce(pending()).mockResolvedValueOnce(pending()).mockResolvedValueOnce(completed('hola cv'));

    const result = new IcaProvider(CONFIG).waitForFile('f-1', AbortSignal.timeout(60_000));
    await jest.advanceTimersByTimeAsync(10_000);

    await expect(result).resolves.toBe('hola cv');
    expect(fetchSpy).toHaveBeenCalledTimes(3);
    expect(fetchSpy.mock.calls[0][0]).toBe(`${URL_BASE}/files/f-1`);
    expect(fetchSpy.mock.calls[0][1]?.method).toBe('GET');
  });

  it('should parse leniently a body with raw control characters inside JSON strings', async () => {
    const body = '{\n "id": "f-1",\n "data": {"status": "completed", "content": "linea1\nlinea2\tcol\u0001"}\n}';
    fetchSpy.mockResolvedValue(raw(body));

    await expect(new IcaProvider(CONFIG).waitForFile('f-1')).resolves.toBe('linea1\nlinea2\tcol\u0001');
  });

  it('should stop polling with TIMEOUT when the total-timeout signal aborts', async () => {
    jest.useFakeTimers();
    fetchSpy.mockImplementation(() => Promise.resolve(pending()));
    const controller = new AbortController();

    const result = new IcaProvider(CONFIG).waitForFile('f-1', controller.signal);
    const assertion = expect(result).rejects.toMatchObject({ kind: 'TIMEOUT' });
    await jest.advanceTimersByTimeAsync(1500);
    controller.abort();
    await jest.advanceTimersByTimeAsync(5000);

    await assertion;
    const callsAtAbort = fetchSpy.mock.calls.length;
    await jest.advanceTimersByTimeAsync(10_000);
    expect(fetchSpy.mock.calls.length).toBe(callsAtAbort);
  });

});

describe('IcaProvider.waitForFile failures', () => {
  it('should fail with INVALID_OUTPUT when ICA marks the file as failed', async () => {
    fetchSpy.mockResolvedValue(json({ id: 'f-1', data: { status: 'failed' } }));

    await expect(new IcaProvider(CONFIG).waitForFile('f-1')).rejects.toMatchObject({ kind: 'INVALID_OUTPUT' });
  });

  it('should never log the extracted content', async () => {
    fetchSpy.mockResolvedValue(completed('CONTENIDO-SECRETO-DEL-CV'));

    await new IcaProvider(CONFIG).waitForFile('f-1');

    expect(JSON.stringify(logged)).not.toContain('CONTENIDO-SECRETO-DEL-CV');
  });
});

describe('IcaProvider.deleteFile', () => {
  it('should send DELETE to /files/{id} with the bearer header', async () => {
    fetchSpy.mockResolvedValue(raw('{}'));

    await new IcaProvider(CONFIG).deleteFile('f-1');

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe(`${URL_BASE}/files/f-1`);
    expect(init?.method).toBe('DELETE');
    expect(init?.headers).toMatchObject({ Authorization: `Bearer ${KEY}` });
  });

  it('should reject with the classified error when ICA fails the delete', async () => {
    fetchSpy.mockResolvedValue(raw('boom', 500));

    await expect(new IcaProvider(CONFIG).deleteFile('f-1')).rejects.toMatchObject({ kind: 'UNREACHABLE' });
  });
});

describe('IcaProvider.complete with files', () => {
  it('should send the files field with the uploaded ids', async () => {
    fetchSpy.mockResolvedValue(json({ model: 'm', choices: [{ message: { content: '{}' }, finish_reason: 'stop' }] }));

    await new IcaProvider(CONFIG).complete({ messages: [{ role: 'user', content: 'U' }], maxTokens: 9, fileIds: ['f-1'] });

    const body = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string) as Record<string, unknown>;
    expect(body.files).toEqual([{ type: 'file', id: 'f-1' }]);
  });
});

describe('IcaProvider.complete under an active FlowLog trace', () => {
  it('should not put the CV text sent in the messages into the flow log', async () => {
    const SECRET_CV_TEXT = 'Texto privado del CV de Persona Inventada, correo persona.inventada@example.test';
    fetchSpy.mockResolvedValue(json({
      choices: [{ message: { content: '{}' }, finish_reason: 'stop' }], model: 'm', usage: { prompt_tokens: 1, completion_tokens: 1 },
    }));
    const context: IFlowContext = { id: 'trace-1', startedAt: Date.now(), reachedHandler: true, depth: 0 };

    await flowStorage.run(context, () =>
      new IcaProvider(CONFIG).complete({ messages: [{ role: 'user', content: SECRET_CV_TEXT }], maxTokens: 16 }));

    expect(JSON.stringify(logged)).not.toContain('Texto privado');
    expect(JSON.stringify(logged)).not.toContain('persona.inventada@example.test');
  });
});

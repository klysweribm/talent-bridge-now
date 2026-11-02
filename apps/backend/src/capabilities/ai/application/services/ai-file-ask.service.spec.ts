import { AiProviderError } from '../../domain/errors/ai-provider.error';
import type { IAiTopicDefinition } from '../../domain/interfaces/ai-topic.interface';
import type { IAiFileUpload } from '../../domain/interfaces/ai-completion.interface';
import { ENABLED_CONFIG } from '../../testing/ai-config.fixture';
import { fakeAiPort, type IFakeAiPort } from '../../testing/fake-ai-port';
import { AiCompletionService } from './ai-completion.service';
import { AiFileAskService } from './ai-file-ask.service';

const FILE: IAiFileUpload = { filename: 'cv.pdf', mimeType: 'application/pdf', data: new Uint8Array([1, 2, 3]) };
const DEFINITION: IAiTopicDefinition = {
  systemPrompt: 'SYS',
  jsonMode: true,
  outputSchema: { validate: (value) => (typeof value === 'object' && value !== null ? null : 'not an object') },
};
const OK = { content: '{"a":1}', finishReason: 'stop', model: 'test-model' } as const;

function setup(config = ENABLED_CONFIG): { service: AiFileAskService } & IFakeAiPort {
  const fake = fakeAiPort();
  fake.uploadFile.mockResolvedValue('f-1');
  fake.waitForFile.mockResolvedValue('texto');
  fake.deleteFile.mockResolvedValue(undefined);
  const completion = new AiCompletionService(fake.port, config, {});
  return { service: new AiFileAskService(fake.port, config, completion), ...fake };
}
const ask = (service: AiFileAskService): ReturnType<AiFileAskService['ask']> =>
  service.ask({ file: FILE, definition: DEFINITION, query: 'Extrae' });

describe('AiFileAskService success', () => {
  it('should upload, wait, ask with the file id and delete the file afterwards', async () => {
    const { service, uploadFile, waitForFile, complete, deleteFile } = setup();
    complete.mockResolvedValue(OK);

    const result = await ask(service);

    expect(result).toEqual({ ok: true, answer: '{"a":1}', source: 'ica', model: 'test-model' });
    expect(uploadFile).toHaveBeenCalledWith(FILE, expect.any(AbortSignal));
    expect(waitForFile).toHaveBeenCalledWith('f-1', expect.any(AbortSignal));
    expect(complete.mock.calls[0][0]).toMatchObject({ fileIds: ['f-1'], jsonMode: true, maxTokens: 256 });
    expect(complete.mock.calls[0][0].messages).toEqual([
      { role: 'system', content: 'SYS' }, { role: 'user', content: 'Extrae' },
    ]);
    expect(deleteFile).toHaveBeenCalledWith('f-1');
  });

});

describe('AiFileAskService repair', () => {
  it('should repair a fenced answer through the same file', async () => {
    const { service, complete } = setup();
    complete.mockResolvedValueOnce({ ...OK, content: 'no json' }).mockResolvedValueOnce({ ...OK, content: '```json\n{"b":2}\n```' });

    const result = await ask(service);

    expect(result).toMatchObject({ ok: true, answer: '{"b":2}' });
    expect(complete.mock.calls[1][0].fileIds).toEqual(['f-1']);
  });
});

describe('AiFileAskService failures', () => {
  it('should delete the file and return the reason when the chat fails', async () => {
    const { service, complete, deleteFile } = setup();
    complete.mockRejectedValue(new AiProviderError('x', 'RATE_LIMITED', 429));

    await expect(ask(service)).resolves.toEqual({ ok: false, reason: 'RATE_LIMITED' });
    expect(deleteFile).toHaveBeenCalledWith('f-1');
  });

  it('should delete the file when waiting for it fails', async () => {
    const { service, waitForFile, complete, deleteFile } = setup();
    waitForFile.mockRejectedValue(new AiProviderError('x', 'TIMEOUT'));

    await expect(ask(service)).resolves.toEqual({ ok: false, reason: 'TIMEOUT' });
    expect(complete).not.toHaveBeenCalled();
    expect(deleteFile).toHaveBeenCalledWith('f-1');
  });

  it('should delete the file when the answer is invalid after one repair', async () => {
    const { service, complete, deleteFile } = setup();
    complete.mockResolvedValue({ ...OK, content: 'sin json' });

    await expect(ask(service)).resolves.toEqual({ ok: false, reason: 'INVALID_OUTPUT' });
    expect(deleteFile).toHaveBeenCalledTimes(1);
  });

  it('should not try to delete when the upload itself failed', async () => {
    const { service, uploadFile, deleteFile } = setup();
    uploadFile.mockRejectedValue(new AiProviderError('x', 'UNAUTHORIZED', 400));

    await expect(ask(service)).resolves.toEqual({ ok: false, reason: 'UNAUTHORIZED' });
    expect(deleteFile).not.toHaveBeenCalled();
  });

  it('should keep the result when deleting the file fails', async () => {
    const { service, complete, deleteFile } = setup();
    complete.mockResolvedValue(OK);
    deleteFile.mockRejectedValue(new AiProviderError('x', 'UNREACHABLE', 500));

    await expect(ask(service)).resolves.toMatchObject({ ok: true });
  });

});

describe('AiFileAskService edge cases', () => {
  it('should return UNREACHABLE and never throw on an unexpected error', async () => {
    const { service, uploadFile } = setup();
    uploadFile.mockRejectedValue(new TypeError('inesperado'));

    await expect(ask(service)).resolves.toEqual({ ok: false, reason: 'UNREACHABLE' });
  });

  it('should return NOT_CONFIGURED without touching the provider when AI is off', async () => {
    const { service, uploadFile } = setup({ enabled: false });

    await expect(ask(service)).resolves.toEqual({ ok: false, reason: 'NOT_CONFIGURED' });
    expect(uploadFile).not.toHaveBeenCalled();
  });
});

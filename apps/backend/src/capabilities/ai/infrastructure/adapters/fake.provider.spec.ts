import { AI_TOPICS } from '../../domain/ai-topics';
import { FakeProvider } from './fake.provider';

describe('FakeProvider', () => {
  it('should answer a fixed text per topic without network', async () => {
    const provider = new FakeProvider();
    const request = { messages: [{ role: 'system', content: AI_TOPICS.general.systemPrompt }, { role: 'user', content: 'x' }], maxTokens: 1 } as const;

    const first = await provider.complete(request);
    const second = await provider.complete(request);

    expect(first.content).toBeTruthy();
    expect(first).toEqual(second);
    expect(first.finishReason).toBe('stop');
  });

  it('should list a single fake model', async () => {
    await expect(new FakeProvider().listModels()).resolves.toHaveLength(1);
  });

  it('should fake the file lifecycle deterministically', async () => {
    const provider = new FakeProvider();
    const file = { filename: 'cv.pdf', mimeType: 'application/pdf', data: new Uint8Array([1]) };

    const id = await provider.uploadFile(file);

    expect(id).toBeTruthy();
    await expect(provider.waitForFile(id)).resolves.toEqual(expect.any(String));
    await expect(provider.deleteFile(id)).resolves.toBeUndefined();
  });

  it('should answer a fixed JSON draft when the request carries file ids', async () => {
    const provider = new FakeProvider();

    const result = await provider.complete({ messages: [{ role: 'user', content: 'x' }], maxTokens: 1, fileIds: ['f'] });

    const draft = JSON.parse(result.content) as { fullName?: unknown; email?: unknown };
    expect(typeof draft.fullName).toBe('string');
    expect(typeof draft.email).toBe('string');
  });

  it('should answer a fixed JSON draft for an inline CV message (no file ids)', async () => {
    const result = await new FakeProvider().complete({ messages: [{ role: 'user', content: 'x\n<cv>\ntexto\n</cv>' }], maxTokens: 1 });

    expect((JSON.parse(result.content) as { fullName?: unknown }).fullName).toEqual(expect.any(String));
  });
});

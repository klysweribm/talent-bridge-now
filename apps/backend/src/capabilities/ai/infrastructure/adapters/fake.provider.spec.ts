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
});

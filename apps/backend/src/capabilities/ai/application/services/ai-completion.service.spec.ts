import type { TAiTopic } from '@ibm-talent-bridge/shared-types';
import { fakeAiPort, type IFakeAiPort } from '../../testing/fake-ai-port';
import type { IAiTopicDefinition } from '../../domain/interfaces/ai-topic.interface';
import type { IAiCompletion } from '../../domain/interfaces/ai-completion.interface';
import { AiProviderError } from '../../domain/errors/ai-provider.error';
import type { TAiConfig } from '../../domain/interfaces/ai-config.interface';
import { ENABLED_CONFIG } from '../../testing/ai-config.fixture';
import { AiCompletionService } from './ai-completion.service';


const TEXT_TOPIC: IAiTopicDefinition = { systemPrompt: 'SYS-TEXT' };
const JSON_TOPIC: IAiTopicDefinition = {
  systemPrompt: 'SYS-JSON',
  jsonMode: true,
  outputSchema: { validate: (value) => (typeof value === 'object' && value !== null && 'score' in value ? null : 'Missing score') },
};
const TOPICS = { general: TEXT_TOPIC, 'test-json': JSON_TOPIC } as unknown as Readonly<Record<TAiTopic, IAiTopicDefinition>>;
const completion = (content: string, finishReason = 'stop'): IAiCompletion => ({
  content, finishReason, model: 'test-model', usage: { promptTokens: 1, completionTokens: 2 },
});

function setup(config: TAiConfig = ENABLED_CONFIG): { service: AiCompletionService } & IFakeAiPort {
  const fake = fakeAiPort();
  return { service: new AiCompletionService(fake.port, config, TOPICS), ...fake };
}

describe('AiCompletionService', () => {
  it('should send the topic system prompt, the query and the configured limits', async () => {
    const { service, complete } = setup();
    complete.mockResolvedValue(completion('hola'));

    const result = await service.complete({ topic: 'general', query: 'Qué tal' });

    expect(result).toEqual({ answer: 'hola', topic: 'general', source: 'ica', model: 'test-model', usage: { promptTokens: 1, completionTokens: 2 } });
    const request = complete.mock.calls[0][0];
    expect(request.messages).toEqual([{ role: 'system', content: 'SYS-TEXT' }, { role: 'user', content: 'Qué tal' }]);
    expect(request.maxTokens).toBe(256);
    expect(request.jsonMode).toBeFalsy();
    expect(request.signal).toBeInstanceOf(AbortSignal);
  });

  it('should delimit the optional context apart from the query', async () => {
    const { service, complete } = setup();
    complete.mockResolvedValue(completion('ok'));

    await service.complete({ topic: 'general', query: 'Q', context: 'CTX' });

    const user = complete.mock.calls[0][0].messages[1].content;
    expect(user).toContain('CTX');
    expect(user).toContain('Q');
    expect(user.indexOf('CTX')).toBeLessThan(user.indexOf('Q'));
  });

  it('should throw NOT_CONFIGURED without calling the port when AI is disabled', async () => {
    const { service, complete } = setup({ enabled: false });

    await expect(service.complete({ topic: 'general', query: 'Q' })).rejects.toMatchObject({ kind: 'NOT_CONFIGURED' });
    expect(complete).not.toHaveBeenCalled();
  });

  it('should throw TRUNCATED when the model stopped by length', async () => {
    const { service, complete } = setup();
    complete.mockResolvedValue(completion('cortad', 'length'));

    await expect(service.complete({ topic: 'general', query: 'Q' })).rejects.toMatchObject({ kind: 'TRUNCATED' });
  });

});

describe('AiCompletionService with a JSON topic and output schema', () => {
  {
    it('should request json mode and return the validated JSON as the answer', async () => {
      const { service, complete } = setup();
      complete.mockResolvedValue(completion('```json\n{"score": 5}\n```'));

      const result = await service.complete({ topic: 'test-json' as TAiTopic, query: 'Q' });

      expect(complete.mock.calls[0][0].jsonMode).toBe(true);
      expect(result.answer).toBe('{"score":5}');
    });

    it('should repair once when the schema fails and then succeed', async () => {
      const { service, complete } = setup();
      complete.mockResolvedValueOnce(completion('{"nope":1}')).mockResolvedValueOnce(completion('{"score":9}'));

      const result = await service.complete({ topic: 'test-json' as TAiTopic, query: 'Q' });

      expect(result.answer).toBe('{"score":9}');
      expect(complete).toHaveBeenCalledTimes(2);
      expect(complete.mock.calls[1][0].messages.at(-1)?.content).toContain('Missing score');
    });

    it('should throw INVALID_OUTPUT after a single failed repair', async () => {
      const { service, complete } = setup();
      complete.mockResolvedValue(completion('{"nope":1}'));

      await expect(service.complete({ topic: 'test-json' as TAiTopic, query: 'Q' })).rejects.toMatchObject({ kind: 'INVALID_OUTPUT' });
      expect(complete).toHaveBeenCalledTimes(2);
    });

    it('should propagate provider errors', async () => {
      const { service, complete } = setup();
      complete.mockRejectedValue(new AiProviderError('x', 'RATE_LIMITED', 429));

      await expect(service.complete({ topic: 'test-json' as TAiTopic, query: 'Q' })).rejects.toMatchObject({ kind: 'RATE_LIMITED' });
    });
  }
});
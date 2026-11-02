import type { TAiUnavailableReason } from '@ibm-talent-bridge/shared-types';
import { AiProviderError } from '../../domain/errors/ai-provider.error';
import { AI_TOPICS } from '../../domain/ai-topics';
import { fakeAiPort, type IFakeAiPort } from '../../testing/fake-ai-port';
import { AiCompletionService } from './ai-completion.service';
import { AiCoordinatorService } from './ai-coordinator.service';
import { AiFileAskService } from './ai-file-ask.service';
import { ENABLED_CONFIG } from '../../testing/ai-config.fixture';

function setup(config = ENABLED_CONFIG): { coordinator: AiCoordinatorService } & IFakeAiPort {
  const fake = fakeAiPort();
  const completion = new AiCompletionService(fake.port, config, AI_TOPICS);
  return { coordinator: new AiCoordinatorService(completion, new AiFileAskService(fake.port, config, completion)), ...fake };
}

describe('AiCoordinatorService', () => {
  it('should return ok with answer, topic, source, model and usage', async () => {
    const { coordinator, complete } = setup();
    complete.mockResolvedValue({ content: 'hola', finishReason: 'stop', model: 'test-model', usage: { promptTokens: 1, completionTokens: 2 } });

    await expect(coordinator.ask({ topic: 'general', query: 'Q' })).resolves.toEqual({
      ok: true, answer: 'hola', topic: 'general', source: 'ica', model: 'test-model', usage: { promptTokens: 1, completionTokens: 2 },
    });
  });

  it.each<TAiUnavailableReason>(['UNAUTHORIZED', 'MODEL_NOT_FOUND', 'UNREACHABLE', 'TIMEOUT', 'RATE_LIMITED', 'TRUNCATED', 'INVALID_OUTPUT', 'NOT_CONFIGURED'])(
    'should return ok:false with reason %s and never throw when the provider fails with it',
    async (reason) => {
      const { coordinator, complete } = setup();
      complete.mockRejectedValue(new AiProviderError('fail', reason));

      await expect(coordinator.ask({ topic: 'general', query: 'Q' })).resolves.toEqual({ ok: false, reason });
    },
  );

  it('should return UNREACHABLE and never throw when the provider throws an unexpected error', async () => {
    const { coordinator, complete } = setup();
    complete.mockRejectedValue(new Error('inesperado'));

    await expect(coordinator.ask({ topic: 'general', query: 'Q' })).resolves.toEqual({ ok: false, reason: 'UNREACHABLE' });
  });

  it('should return NOT_CONFIGURED when AI is disabled', async () => {
    const { coordinator, complete } = setup({ enabled: false });

    await expect(coordinator.ask({ topic: 'general', query: 'Q' })).resolves.toEqual({ ok: false, reason: 'NOT_CONFIGURED' });
    expect(complete).not.toHaveBeenCalled();
  });
});

describe('AiCoordinatorService.askWithDefinition', () => {
  const definition = { systemPrompt: 'SYS', jsonMode: true } as const;

  it('should call the provider once with the caller prompt, no file ids, and return the answer', async () => {
    const { coordinator, complete } = setup();
    complete.mockResolvedValue({ content: '{"a":1}', finishReason: 'stop', model: 'test-model' });

    await expect(coordinator.askWithDefinition({ definition, query: 'Q' })).resolves.toEqual({ ok: true, answer: '{"a":1}', source: 'ica', model: 'test-model' });

    const request = complete.mock.calls[0][0];
    expect(request.messages).toEqual([{ role: 'system', content: 'SYS' }, { role: 'user', content: 'Q' }]);
    expect(request.fileIds).toBeUndefined();
  });

  it('should return ok:false and never throw on provider failures', async () => {
    const { coordinator, complete } = setup();
    complete.mockRejectedValueOnce(new AiProviderError('x', 'TIMEOUT'));
    await expect(coordinator.askWithDefinition({ definition, query: 'Q' })).resolves.toEqual({ ok: false, reason: 'TIMEOUT' });
    complete.mockRejectedValueOnce(new Error('boom'));
    await expect(coordinator.askWithDefinition({ definition, query: 'Q' })).resolves.toEqual({ ok: false, reason: 'UNREACHABLE' });
  });

  it('should return NOT_CONFIGURED when AI is disabled', async () => {
    const { coordinator } = setup({ enabled: false } as never);
    await expect(coordinator.askWithDefinition({ definition, query: 'Q' })).resolves.toEqual({ ok: false, reason: 'NOT_CONFIGURED' });
  });
});

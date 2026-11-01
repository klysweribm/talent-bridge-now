import type { TAiUnavailableReason } from '@ibm-talent-bridge/shared-types';
import { AiProviderError } from '../../domain/errors/ai-provider.error';
import { AI_TOPICS } from '../../domain/ai-topics';
import { fakeAiPort, type IFakeAiPort } from '../../testing/fake-ai-port';
import { AiCompletionService } from './ai-completion.service';
import { AiCoordinatorService } from './ai-coordinator.service';
import { ENABLED_CONFIG } from '../../testing/ai-config.fixture';

function setup(config = ENABLED_CONFIG): { coordinator: AiCoordinatorService } & IFakeAiPort {
  const fake = fakeAiPort();
  return { coordinator: new AiCoordinatorService(new AiCompletionService(fake.port, config, AI_TOPICS)), ...fake };
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

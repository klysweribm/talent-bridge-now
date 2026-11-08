import type { IAiCompletion } from '../../domain/interfaces/ai-completion.interface';
import type { IAiTopicDefinition } from '../../domain/interfaces/ai-topic.interface';
import { ENABLED_CONFIG } from '../../testing/ai-config.fixture';
import { fakeAiPort } from '../../testing/fake-ai-port';
import { AiCompletionService } from './ai-completion.service';

const DEFINITION: IAiTopicDefinition = {
  systemPrompt: 'SYS',
  jsonMode: true,
  outputSchema: { validate: (value) => (typeof value === 'object' && value !== null && 'ok' in value ? null : 'Missing ok') },
};
const reply = (content: string): IAiCompletion => ({ content, finishReason: 'stop', model: 'm' });
const DRAFT_TIMEOUT_MS = 30_000;

function setup(): { service: AiCompletionService; complete: ReturnType<typeof fakeAiPort>['complete'] } {
  const fake = fakeAiPort();
  return { service: new AiCompletionService(fake.port, ENABLED_CONFIG, {} as never), complete: fake.complete };
}

describe('AiCompletionService.completeWithDefinition — timeout propio', () => {
  it('should use totalTimeoutMs when the caller gives no timeoutMs (regresión del CV)', async () => {
    const spy = jest.spyOn(AbortSignal, 'timeout');
    const { service, complete } = setup();
    complete.mockResolvedValue(reply('{"ok":1}'));

    await service.completeWithDefinition({ definition: DEFINITION, query: 'Q' });

    expect(spy).toHaveBeenCalledWith(ENABLED_CONFIG.enabled ? ENABLED_CONFIG.totalTimeoutMs : -1);
    spy.mockRestore();
  });

  it('should replace the total timeout with the caller timeoutMs', async () => {
    const spy = jest.spyOn(AbortSignal, 'timeout');
    const { service, complete } = setup();
    complete.mockResolvedValue(reply('{"ok":1}'));

    await service.completeWithDefinition({ definition: DEFINITION, query: 'Q', timeoutMs: DRAFT_TIMEOUT_MS });

    expect(spy).toHaveBeenCalledWith(DRAFT_TIMEOUT_MS);
    spy.mockRestore();
  });

  it('should send the SAME signal on the first attempt and on the repair', async () => {
    const { service, complete } = setup();
    complete.mockResolvedValueOnce(reply('no es json')).mockResolvedValueOnce(reply('{"ok":1}'));

    await service.completeWithDefinition({ definition: DEFINITION, query: 'Q', timeoutMs: DRAFT_TIMEOUT_MS });

    expect(complete).toHaveBeenCalledTimes(2);
    expect(complete.mock.calls[1][0].signal).toBe(complete.mock.calls[0][0].signal);
  });

  it('should not launch the repair and should fail with TIMEOUT when the first attempt used up the whole time', async () => {
    // `AbortSignal.timeout` usa temporizadores internos que los fake timers no controlan: se sustituye por un controller.
    const controller = new AbortController();
    const spy = jest.spyOn(AbortSignal, 'timeout').mockReturnValue(controller.signal);
    const { service, complete } = setup();
    complete.mockImplementationOnce(() => {
      controller.abort();
      return Promise.resolve(reply('no es json'));
    });

    await expect(service.completeWithDefinition({ definition: DEFINITION, query: 'Q', timeoutMs: DRAFT_TIMEOUT_MS })).rejects.toMatchObject({
      kind: 'TIMEOUT',
    });
    expect(complete).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});

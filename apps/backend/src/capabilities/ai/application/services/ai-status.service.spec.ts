import { AiProviderError } from '../../domain/errors/ai-provider.error';
import type { TAiConfig } from '../../domain/interfaces/ai-config.interface';
import { fakeAiPort, type IFakeAiPort } from '../../testing/fake-ai-port';
import { AiStatusService } from './ai-status.service';
import { ENABLED_CONFIG } from '../../testing/ai-config.fixture';

function setup(config: TAiConfig = ENABLED_CONFIG): { service: AiStatusService } & IFakeAiPort {
  const fake = fakeAiPort();
  return { service: new AiStatusService(fake.port, config), ...fake };
}

describe('AiStatusService', () => {
  it('should be available when the configured model is listed', async () => {
    const { service, listModels } = setup();
    listModels.mockResolvedValue(['a', 'test-model']);

    await expect(service.getStatus()).resolves.toEqual({ available: true, source: 'ica', model: 'test-model' });
  });

  it('should report MODEL_NOT_FOUND when the configured model is not listed', async () => {
    const { service, listModels } = setup();
    listModels.mockResolvedValue(['otro']);

    await expect(service.getStatus()).resolves.toEqual({ available: false, source: 'ica', model: 'test-model', reason: 'MODEL_NOT_FOUND' });
  });

  it('should report NOT_CONFIGURED without calling the port when disabled', async () => {
    const { service, listModels } = setup({ enabled: false });

    await expect(service.getStatus()).resolves.toEqual({ available: false, source: null, model: null, reason: 'NOT_CONFIGURED' });
    expect(listModels).not.toHaveBeenCalled();
  });

  it('should map a rejected key to UNAUTHORIZED', async () => {
    const { service, listModels } = setup();
    listModels.mockRejectedValue(new AiProviderError('x', 'UNAUTHORIZED', 400));

    await expect(service.getStatus()).resolves.toMatchObject({ available: false, reason: 'UNAUTHORIZED' });
  });

  it.each([new TypeError('fetch failed'), new Error('x')])('should map %p to UNREACHABLE and never throw', async (error) => {
    const { service, listModels } = setup();
    listModels.mockRejectedValue(error);

    await expect(service.getStatus()).resolves.toMatchObject({ available: false, reason: 'UNREACHABLE' });
  });

  it('should never include the key in the status', async () => {
    const { service, listModels } = setup();
    listModels.mockRejectedValue(new AiProviderError('x', 'UNAUTHORIZED', 400));

    expect(JSON.stringify(await service.getStatus())).not.toContain('test-key-not-real');
  });
});

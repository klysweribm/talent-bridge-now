import { Logger } from '@nestjs/common';
import { AiProviderError } from '../../domain/errors/ai-provider.error';
import { abortableDelay, buildAiRetryOptions, isRetryableAiError } from './retry-config.util';

describe('isRetryableAiError', () => {
  it.each([
    [new AiProviderError('x', 'RATE_LIMITED', 429), true],
    [new AiProviderError('x', 'UNREACHABLE', 503), true],
    [new AiProviderError('x', 'UNREACHABLE'), true],
    [new AiProviderError('x', 'UNREACHABLE', 400), false],
    [new AiProviderError('x', 'UNAUTHORIZED', 400), false],
    [new AiProviderError('x', 'MODEL_NOT_FOUND', 400), false],
    [new AiProviderError('x', 'TIMEOUT'), false],
    [new AiProviderError('x', 'INVALID_OUTPUT'), false],
    [new Error('x'), false],
  ])('should classify %p as retryable=%s', (error, expected) => {
    expect(isRetryableAiError(error)).toBe(expected);
  });
});

describe('buildAiRetryOptions', () => {
  it('should use exponential backoff capped at maxMs', () => {
    const options = buildAiRetryOptions({ maxAttempts: 5, baseMs: 100, maxMs: 350 }, new Logger('t'));

    expect([1, 2, 3, 4].map(options.backoffMs)).toEqual([100, 200, 350, 350]);
    expect(options.maxAttempts).toBe(5);
  });
});

describe('abortableDelay', () => {
  it('should resolve after the wait', async () => {
    await expect(abortableDelay(1)).resolves.toBeUndefined();
  });

  it('should reject with TIMEOUT as soon as the signal aborts', async () => {
    const controller = new AbortController();
    const pending = abortableDelay(10_000, controller.signal);
    controller.abort();

    await expect(pending).rejects.toMatchObject({ kind: 'TIMEOUT' });
  });

  it('should reject immediately when the signal is already aborted', async () => {
    await expect(abortableDelay(10_000, AbortSignal.abort())).rejects.toMatchObject({ kind: 'TIMEOUT' });
  });
});

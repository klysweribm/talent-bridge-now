import { withRetry } from './with-retry.util';

const boom = (): Error => new Error('boom');

describe('withRetry', () => {
  it('should return the first success without waiting', async () => {
    const delay = jest.fn();

    await expect(withRetry(() => Promise.resolve(1), { maxAttempts: 3, isRetryable: () => true, backoffMs: () => 5, delay })).resolves.toBe(1);
    expect(delay).not.toHaveBeenCalled();
  });

  it('should retry retryable errors with the backoff and then succeed', async () => {
    const fn = jest.fn().mockRejectedValueOnce(boom()).mockRejectedValueOnce(boom()).mockResolvedValue('ok');
    const delay = jest.fn().mockResolvedValue(undefined);
    const onRetry = jest.fn();

    await expect(withRetry(fn, { maxAttempts: 3, isRetryable: () => true, backoffMs: (n) => n * 10, delay, onRetry })).resolves.toBe('ok');
    expect(delay.mock.calls).toEqual([[10], [20]]);
    expect(onRetry).toHaveBeenCalledTimes(2);
  });

  it('should not retry a non-retryable error', async () => {
    const fn = jest.fn().mockRejectedValue(boom());

    await expect(withRetry(fn, { maxAttempts: 3, isRetryable: () => false, backoffMs: () => 1, delay: jest.fn() })).rejects.toThrow('boom');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should stop at maxAttempts and keep the error type with an attempts suffix', async () => {
    class Custom extends Error { readonly kind = 'X'; }
    const fn = jest.fn().mockRejectedValue(new Custom('late'));

    await expect(withRetry(fn, { maxAttempts: 2, isRetryable: () => true, backoffMs: () => 1, delay: jest.fn().mockResolvedValue(undefined) }))
      .rejects.toMatchObject({ message: 'late (after 2 attempts)', kind: 'X' });
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

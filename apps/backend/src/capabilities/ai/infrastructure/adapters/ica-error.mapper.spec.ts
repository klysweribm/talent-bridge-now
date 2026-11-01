import { classifyIcaError } from './ica-error.mapper';

describe('classifyIcaError', () => {
  it.each([
    [400, '{"error":"Invalid icaKey"}', 'UNAUTHORIZED'],
    [401, '', 'UNAUTHORIZED'],
    [403, '', 'UNAUTHORIZED'],
    [400, '{"detail":"Model not found"}', 'MODEL_NOT_FOUND'],
    [400, 'litellm.UnsupportedParamsError: temperature', 'MODEL_NOT_FOUND'],
    [429, '', 'RATE_LIMITED'],
    [500, '', 'UNREACHABLE'],
    [503, '', 'UNREACHABLE'],
    [400, '{"error":"otra cosa"}', 'UNREACHABLE'],
  ])('should map status %s with body %j to %s (by body, not by code)', (status, body, kind) => {
    const error = classifyIcaError(status, body);

    expect(error.kind).toBe(kind);
    expect(error.statusCode).toBe(status);
  });

  it('should not echo the response body in the message', () => {
    expect(classifyIcaError(400, '{"error":"Invalid icaKey sk-abc"}').message).not.toContain('sk-abc');
  });
});

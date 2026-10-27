import { REDACTED, redact } from './redact';

const FAKE_JWT = 'eyJfake.payload.signature';

describe('redact', () => {
  it('should hide secret keys at any depth, case-insensitively', () => {
    const result = redact({ a: { Authorization: 'x', nested: [{ PASSWORD: 'y' }] }, ok: 'visible' });
    expect(result).toEqual({ a: { Authorization: REDACTED, nested: [{ PASSWORD: REDACTED }] }, ok: 'visible' });
  });

  it('should hide values shaped like a JWT or Bearer even under a harmless key', () => {
    expect(redact({ note: FAKE_JWT, header: 'Bearer abc' })).toEqual({ note: REDACTED, header: REDACTED });
  });

  it('should trim long arrays and strings', () => {
    const result = redact({ list: Array.from({ length: 25 }, (_, i) => i), text: 'a'.repeat(500) }) as {
      list: unknown[];
      text: string;
    };
    expect(result.list).toHaveLength(11);
    expect(result.list[10]).toBe('(+15 más)');
    expect(result.text.length).toBeLessThan(500);
  });

  it('should mark circular references', () => {
    const node: Record<string, unknown> = { name: 'n' };
    node.self = node;
    expect(redact(node)).toEqual({ name: 'n', self: '[Circular]' });
  });

  it('should replace buffers with a binary marker', () => {
    expect(redact({ file: Buffer.from('abc') })).toEqual({ file: '[binary]' });
  });

  it('should not mutate the input', () => {
    const input = { token: 'x' };
    redact(input);
    expect(input.token).toBe('x');
  });
});

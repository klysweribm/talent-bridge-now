import { buildInputClassName } from './inputField.utils';

describe('buildInputClassName', () => {
  it('should use the border and placeholder tokens instead of raw hex when there is no error', () => {
    const cls = buildInputClassName(false, false);
    expect(cls).toContain('border-outline-field');
    expect(cls).toContain('placeholder:text-text-placeholder');
    expect(cls).not.toMatch(/#[0-9a-f]{6}/i);
  });
});

import { colors } from '../../tailwind.colors';

describe('input color tokens (DT-044)', () => {
  it('should define the field border and placeholder tokens with their original values', () => {
    expect(colors.outline.field).toBe('#8d8d8d');
    expect(colors.text.placeholder).toBe('#a8a8a8');
  });
});

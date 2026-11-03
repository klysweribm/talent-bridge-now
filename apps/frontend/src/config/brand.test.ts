import { BRAND } from './brand';

describe('BRAND', () => {
  it('should expose the full product name and the short name without the IBM prefix', () => {
    expect(BRAND.productFullName).toBe('IBM Future Now Portal');
    expect(BRAND.productName).toBe('Future Now Portal');
    expect(BRAND.productFullName).toBe(`${BRAND.companyName} ${BRAND.productName}`);
  });

  it('should not keep the former product name', () => {
    expect(JSON.stringify(BRAND)).not.toContain('Talent Bridge');
  });
});

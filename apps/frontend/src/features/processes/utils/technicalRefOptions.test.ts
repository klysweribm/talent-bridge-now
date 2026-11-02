import type { IProcessTechnicalRef } from '@ibm-talent-bridge/shared-types';
import { buildTechnicalRefOptions, sameIdSet, toggleTechnicalRef } from './technicalRefOptions';

const ref = (id: string, status: 'active' | 'inactive'): IProcessTechnicalRef => ({ id, fullName: id, email: `${id}@x`, role: 'technical_ref', band: 7, description: '', status });

describe('technicalRefOptions', () => {
  it('should merge assigned and available without duplicates, keeping inactive assigned', () => {
    const options = buildTechnicalRefOptions([ref('a', 'inactive'), ref('b', 'active')], [{ id: 'b', fullName: 'b' }, { id: 'c', fullName: 'c', band: 5 }]);
    expect(options.map(option => option.id)).toEqual(['a', 'b', 'c']);
    expect(options[0].inactive).toBe(true);
    expect(options[2]).toMatchObject({ band: 5, inactive: false });
  });

  it('should compare ids as a set', () => {
    expect(sameIdSet(['a', 'b'], ['b', 'a'])).toBe(true);
    expect(sameIdSet(['a'], ['a', 'b'])).toBe(false);
    expect(sameIdSet([], [])).toBe(true);
  });

  it('should toggle and enforce the cap', () => {
    expect(toggleTechnicalRef(['a'], 'b', 2)).toEqual(['a', 'b']);
    expect(toggleTechnicalRef(['a', 'b'], 'c', 2)).toEqual(['a', 'b']);
    expect(toggleTechnicalRef(['a', 'b'], 'a', 2)).toEqual(['b']);
  });
});

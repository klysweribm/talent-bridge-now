import type { IBenchResource } from '@ibm-talent-bridge/shared-types';
import { buildSearchGroups } from './buildSearchGroups';

function resource(overrides: Partial<IBenchResource>): IBenchResource {
  return {
    id: '1', benchCode: 'BN-0001', displayName: 'Lucía Fernández', primaryRole: 'Backend Developer',
    practice: 'Cloud', seniority: 'sr', band: 8,
    skills: [{ name: 'Java', level: 5, years: 8 }],
    languages: [{ code: 'es', level: 'native' }],
    location: { country: 'Argentina', city: 'Córdoba' },
    benchSince: '2026-01-10', availableFrom: '2026-02-01', status: 'available',
    ...overrides,
  };
}

const RESOURCES = [
  resource({}),
  resource({ id: '2', benchCode: 'BN-0002', displayName: 'Diego Rojas', primaryRole: 'QA Engineer', skills: [{ name: 'Cypress', level: 3, years: 2 }] }),
];

describe('buildSearchGroups', () => {
  it('should return no groups for an empty query', () => {
    expect(buildSearchGroups(RESOURCES, '   ')).toEqual([]);
  });

  it('should match by name, role, code or skill, case-insensitively', () => {
    expect(buildSearchGroups(RESOURCES, 'lucía')[0]?.items).toHaveLength(1);
    expect(buildSearchGroups(RESOURCES, 'qa')[0]?.items[0]?.meta).toBe('BN-0002');
    expect(buildSearchGroups(RESOURCES, 'bn-000')[0]?.items).toHaveLength(2);
    expect(buildSearchGroups(RESOURCES, 'CYPRESS')[0]?.items[0]?.title).toBe('Diego Rojas');
  });

  it('should link each result to the bench drawer', () => {
    expect(buildSearchGroups(RESOURCES, 'diego')[0]?.items[0]?.to).toBe('/bench?resource=BN-0002');
  });

  it('should return no groups when nothing matches', () => {
    expect(buildSearchGroups(RESOURCES, 'zzz')).toEqual([]);
  });
});

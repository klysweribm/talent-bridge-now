import { buildBenchQuery } from './buildBenchQuery';

describe('buildBenchQuery', () => {
  it('should return an empty string when the query has no values', () => {
    expect(buildBenchQuery({})).toBe('');
  });

  it('should omit empty arrays, empty strings and undefined values', () => {
    expect(buildBenchQuery({ skills: [], seniority: [], country: '', availableBy: undefined })).toBe('');
  });

  it('should repeat array params instead of joining them', () => {
    const qs = buildBenchQuery({ skills: ['Java', 'Spring Boot'], seniority: ['sr', 'lead'] });
    expect(new URLSearchParams(qs).getAll('skills')).toEqual(['Java', 'Spring Boot']);
    expect(new URLSearchParams(qs).getAll('seniority')).toEqual(['sr', 'lead']);
  });

  it('should encode special characters in skill names', () => {
    const qs = buildBenchQuery({ skills: ['C#', 'SAP S/4HANA', '.NET'] });
    expect(qs).toContain('skills=C%23');
    expect(qs).not.toContain('#');
    expect(new URLSearchParams(qs).getAll('skills')).toEqual(['C#', 'SAP S/4HANA', '.NET']);
  });

  it('should include page and limit only when provided', () => {
    expect(buildBenchQuery({ country: 'Chile', availableBy: '2026-11-05' }))
      .toBe('availableBy=2026-11-05&country=Chile');
    expect(buildBenchQuery({ page: 2, limit: 10 })).toBe('page=2&limit=10');
  });
});

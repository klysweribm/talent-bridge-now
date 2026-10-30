import type { IBenchFilters } from '../types/bench.types';
import { applyBenchFilters, parseBenchParams } from './benchSearchParams';

const parse = (qs: string): IBenchFilters => parseBenchParams(new URLSearchParams(qs));

describe('parseBenchParams', () => {
  it('should return empty defaults when there are no params', () => {
    expect(parse('')).toEqual({ skills: [], seniority: [] });
  });

  it('should read repeated and comma separated values', () => {
    const f = parse('skills=Java&skills=Spring%20Boot&seniority=sr,lead&country=Chile&availableBy=2026-11-05&page=3&limit=10');
    expect(f).toEqual({
      skills: ['Java', 'Spring Boot'], seniority: ['sr', 'lead'],
      country: 'Chile', availableBy: '2026-11-05', page: 3, limit: 10,
    });
  });

  it('should discard invalid values instead of throwing', () => {
    const f = parse('seniority=guru&seniority=jr&availableBy=no-es-fecha&page=-1&limit=500&country=');
    expect(f).toEqual({ skills: [], seniority: ['jr'] });
  });

  it('should discard impossible calendar dates and non integer pages', () => {
    expect(parse('availableBy=2026-02-31&page=1.5')).toEqual({ skills: [], seniority: [] });
  });
});

describe('applyBenchFilters', () => {
  it('should write filters, drop empty ones and keep unrelated params', () => {
    const prev = new URLSearchParams('resource=BN-0001&country=Chile&page=3');
    const next = applyBenchFilters(prev, { skills: ['C#'], seniority: [], country: undefined });
    expect(next.toString()).toBe('resource=BN-0001&skills=C%23');
  });
});

import type { ICandidateListParams } from '../types/candidateList.types';
import { applyCandidateListParams, parseCandidateListParams } from './candidateListSearchParams';

const parse = (qs: string): ICandidateListParams => parseCandidateListParams(new URLSearchParams(qs));

describe('parseCandidateListParams', () => {
  it('should return no values when the URL has no params (default)', () => {
    expect(parse('')).toEqual({});
  });

  it('should read valid page, limit and assignment', () => {
    expect(parse('page=3&limit=10&assignment=assigned')).toEqual({ page: 3, limit: 10, assignment: 'assigned' });
    expect(parse('assignment=available')).toEqual({ assignment: 'available' });
  });

  it.each(['page=0', 'page=-2', 'page=abc', 'page=1.5', 'page=', 'limit=0', 'limit=51', 'limit=x', 'assignment=all', 'assignment=', 'assignment=AVAILABLE'])(
    'should discard invalid %s without throwing', qs => {
      expect(parse(qs)).toEqual({});
    });

  it('should keep the valid params when others are invalid', () => {
    expect(parse('page=2&assignment=nope&limit=500')).toEqual({ page: 2 });
  });
});

describe('applyCandidateListParams', () => {
  it('should set page > 1 and omit page 1', () => {
    expect(applyCandidateListParams(new URLSearchParams(), { page: 2 }).toString()).toBe('page=2');
    expect(applyCandidateListParams(new URLSearchParams('page=2'), { page: 1 }).toString()).toBe('');
  });

  it('should write the assignment and keep limit and foreign params', () => {
    expect(applyCandidateListParams(new URLSearchParams('x=1&limit=10'), { page: 3, limit: 10, assignment: 'available' }).toString())
      .toBe('x=1&page=3&limit=10&assignment=available');
  });

  it('should drop the assignment when it is absent', () => {
    expect(applyCandidateListParams(new URLSearchParams('assignment=assigned'), {}).toString()).toBe('');
  });
});

import type { IProcessListParams } from '../types/processList.types';
import { applyProcessListParams, parseProcessListParams } from './processListSearchParams';

const parse = (qs: string): IProcessListParams => parseProcessListParams(new URLSearchParams(qs));

describe('parseProcessListParams', () => {
  it('should return no values when the URL has no params (default page)', () => {
    expect(parse('')).toEqual({});
  });

  it('should read valid page and limit', () => {
    expect(parse('page=3&limit=10')).toEqual({ page: 3, limit: 10 });
  });

  it.each(['page=0', 'page=-2', 'page=abc', 'page=1.5', 'page='])('should discard invalid %s without throwing', qs => {
    expect(parse(qs)).toEqual({});
  });

  it.each(['limit=0', 'limit=51', 'limit=x'])('should discard invalid %s without throwing', qs => {
    expect(parse(qs)).toEqual({});
  });
});

describe('applyProcessListParams', () => {
  it('should set page > 1 and omit page 1', () => {
    expect(applyProcessListParams(new URLSearchParams(), { page: 2 }).toString()).toBe('page=2');
    expect(applyProcessListParams(new URLSearchParams('page=2'), { page: 1 }).toString()).toBe('');
  });

  it('should keep limit and foreign params', () => {
    expect(applyProcessListParams(new URLSearchParams('x=1&limit=10'), { page: 3, limit: 10 }).toString()).toBe('x=1&page=3&limit=10');
  });
});

import { buildProcessSearchFilter, escapeRegex } from './process-search.filter';

describe('process search filter', () => {
  it('should escape every regex metacharacter', () => {
    const raw = '.*+?^${}()|[]\\';
    const re = new RegExp(escapeRegex(raw));
    expect(re.test(raw)).toBe(true);
    expect(new RegExp(escapeRegex('a.c')).test('abc')).toBe(false);
  });

  it('should return an empty filter without q', () => {
    expect(buildProcessSearchFilter(undefined)).toEqual({});
  });

  it('should build a case-insensitive $or over title, clientName and opportunityRole with an escaped pattern', () => {
    expect(buildProcessSearchFilter('a.b')).toEqual({
      $or: [
        { title: { $regex: 'a\\.b', $options: 'i' } },
        { clientName: { $regex: 'a\\.b', $options: 'i' } },
        { opportunityRole: { $regex: 'a\\.b', $options: 'i' } },
      ],
    });
  });
});

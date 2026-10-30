import { toBenchQuery } from './toBenchQuery';

describe('toBenchQuery', () => {
  it('should return an empty query when there are no filters', () => {
    expect(toBenchQuery({ skills: [], seniority: [] })).toEqual({});
  });

  it('should keep only the filters that have a value', () => {
    expect(toBenchQuery({ skills: ['Java'], seniority: [], country: 'Chile', page: 2 }))
      .toEqual({ skills: ['Java'], country: 'Chile', page: 2 });
  });
});

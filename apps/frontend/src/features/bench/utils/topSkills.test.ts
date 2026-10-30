import type { ISkillLevel } from '@ibm-talent-bridge/shared-types';
import { topSkills } from './topSkills';

const skill = (name: string, level: ISkillLevel['level'], years: number): ISkillLevel => ({ name, level, years });

describe('topSkills', () => {
  it('should order by level, then years, then name', () => {
    const input = [skill('B', 3, 2), skill('A', 3, 2), skill('C', 5, 1), skill('D', 3, 6)];
    expect(topSkills(input, 4).map(s => s.name)).toEqual(['C', 'D', 'A', 'B']);
  });

  it('should return only the top 3 by default', () => {
    const input = [skill('A', 1, 1), skill('B', 2, 1), skill('C', 3, 1), skill('D', 4, 1)];
    expect(topSkills(input).map(s => s.name)).toEqual(['D', 'C', 'B']);
  });

  it('should not mutate the input', () => {
    const input = [skill('A', 1, 1), skill('B', 5, 1)];
    topSkills(input);
    expect(input[0]?.name).toBe('A');
  });
});

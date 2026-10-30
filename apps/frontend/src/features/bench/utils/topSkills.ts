import type { ISkillLevel } from '@ibm-talent-bridge/shared-types';
import { TOP_SKILLS_COUNT } from '../config/bench.constants';

/** Mejores skills: nivel desc, luego años desc, luego nombre. No muta la entrada. */
export function topSkills(skills: readonly ISkillLevel[], count: number = TOP_SKILLS_COUNT): readonly ISkillLevel[] {
  return [...skills]
    .sort((a, b) => b.level - a.level || b.years - a.years || a.name.localeCompare(b.name))
    .slice(0, count);
}

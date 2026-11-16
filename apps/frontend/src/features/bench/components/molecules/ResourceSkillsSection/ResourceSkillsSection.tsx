import type { ISkillLevel } from '@ibm-talent-bridge/shared-types';
import { SKILL_LEVEL_MAX } from '../../../config/bench.constants';
import { LevelSegments } from '../../atoms/LevelSegments';

export interface ResourceSkillsSectionProps {
  readonly skills: readonly ISkillLevel[];
}

export function ResourceSkillsSection({ skills }: ResourceSkillsSectionProps): JSX.Element {
  return (
    <section aria-label="Skills">
      <h3 className="text-h2 text-carbon-gray-100 mb-sm">Skills</h3>
      <ul className="flex flex-col">
        {skills.map(skill => (
          <li key={skill.name} className="flex items-center justify-between gap-base border-b border-carbon-gray-20 py-sm">
            <div className="flex flex-col">
              <span className="text-body text-carbon-gray-100">{skill.name}</span>
              <span className="text-label text-carbon-gray-70">
                Nivel {skill.level} · {skill.years} {skill.years === 1 ? 'año' : 'años'}
              </span>
            </div>
            <div className="flex items-center gap-sm">
              <LevelSegments filled={skill.level} total={SKILL_LEVEL_MAX} />
              <span aria-hidden="true" className="font-mono text-[12px] text-carbon-gray-70">{skill.level}/{SKILL_LEVEL_MAX}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

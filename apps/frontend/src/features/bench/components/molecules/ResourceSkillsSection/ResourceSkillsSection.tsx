import type { ISkillLevel } from '@ibm-talent-bridge/shared-types';

export interface ResourceSkillsSectionProps {
  readonly skills: readonly ISkillLevel[];
}

export function ResourceSkillsSection({ skills }: ResourceSkillsSectionProps): JSX.Element {
  return (
    <section aria-label="Skills">
      <h3 className="text-title-md text-text-primary mb-sm">Skills</h3>
      <ul className="flex flex-col gap-xs">
        {skills.map(skill => (
          <li key={skill.name} className="flex justify-between text-body-md">
            <span className="text-text-primary">{skill.name}</span>
            <span className="text-text-secondary">
              Nivel {skill.level} · {skill.years} {skill.years === 1 ? 'año' : 'años'}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

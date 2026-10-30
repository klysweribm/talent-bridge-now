import type { ISkillLevel } from '@ibm-talent-bridge/shared-types';

export interface SkillChipsProps {
  readonly skills: readonly ISkillLevel[];
  readonly max?:   number;
}

const CHIP = 'inline-flex items-center h-6 px-sm rounded bg-primary-fixed text-label-md text-primary-on-fixed whitespace-nowrap';

export function SkillChips({ skills, max }: SkillChipsProps): JSX.Element {
  if (skills.length === 0) return <span className="text-text-secondary">—</span>;

  const visible = max === undefined ? skills : skills.slice(0, max);
  const hidden = skills.length - visible.length;

  return (
    <ul className="flex flex-wrap gap-xs">
      {visible.map(skill => (
        <li key={skill.name} className={CHIP}>{skill.name} · {skill.level}</li>
      ))}
      {hidden > 0 && <li className={`${CHIP} bg-surface-high text-text-secondary`}>+{hidden}</li>}
    </ul>
  );
}

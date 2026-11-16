import type { ISkillLevel } from '@ibm-talent-bridge/shared-types';
import { SkillChip } from '@shared/components/atoms/SkillChip/SkillChip';

export interface SkillChipsProps {
  readonly skills: readonly ISkillLevel[];
  readonly max?:   number;
}

const MORE = 'inline-flex items-center h-6 px-sm rounded-pill bg-carbon-gray-20 text-label text-carbon-gray-70 whitespace-nowrap';

export function SkillChips({ skills, max }: SkillChipsProps): JSX.Element {
  if (skills.length === 0) return <span className="text-carbon-gray-70">—</span>;

  const visible = max === undefined ? skills : skills.slice(0, max);
  const hidden = skills.length - visible.length;

  return (
    <ul className="flex flex-wrap gap-xs">
      {visible.map(skill => (
        <li key={skill.name}><SkillChip label={`${skill.name} · ${skill.level}`} /></li>
      ))}
      {hidden > 0 && <li className={MORE}>+{hidden}</li>}
    </ul>
  );
}

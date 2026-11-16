import { SkillChip } from '@shared/components/atoms/SkillChip/SkillChip';

export interface SelectedSkillChipsProps {
  readonly skills:   readonly string[];
  readonly onRemove: (skill: string) => void;
}

export function SelectedSkillChips({ skills, onRemove }: SelectedSkillChipsProps): JSX.Element | null {
  if (skills.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-xs">
      {skills.map(skill => (
        <li key={skill}>
          <SkillChip label={skill} removeLabel={`Quitar ${skill}`} onRemove={() => onRemove(skill)} />
        </li>
      ))}
    </ul>
  );
}

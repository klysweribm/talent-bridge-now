export interface SelectedSkillChipsProps {
  readonly skills:   readonly string[];
  readonly onRemove: (skill: string) => void;
}

export function SelectedSkillChips({ skills, onRemove }: SelectedSkillChipsProps): JSX.Element | null {
  if (skills.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-xs">
      {skills.map(skill => (
        <li key={skill} className="inline-flex items-center gap-xs h-6 pl-sm rounded bg-primary-fixed text-label-md text-primary-on-fixed">
          {skill}
          <button type="button" aria-label={`Quitar ${skill}`} className="px-xs" onClick={() => onRemove(skill)}>×</button>
        </li>
      ))}
    </ul>
  );
}

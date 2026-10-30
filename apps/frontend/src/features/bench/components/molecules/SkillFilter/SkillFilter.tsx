import { CONTROL_CLASSES } from '../../../config/bench.constants';
import { SelectedSkillChips } from '../SelectedSkillChips';

export interface SkillFilterProps {
  readonly options:  readonly string[];
  readonly selected: readonly string[];
  readonly onChange: (skills: readonly string[]) => void;
}

export function SkillFilter({ options, selected, onChange }: SkillFilterProps): JSX.Element {
  const remaining = options.filter(option => !selected.includes(option));

  return (
    <div className="flex flex-col gap-xs">
      <label htmlFor="bench-skill-filter" className="text-label-md text-text-secondary">Skills</label>
      <select
        id="bench-skill-filter"
        value=""
        className={CONTROL_CLASSES}
        onChange={event => event.target.value && onChange([...selected, event.target.value])}
      >
        <option value="">Agregar skill…</option>
        {remaining.map(skill => <option key={skill} value={skill}>{skill}</option>)}
      </select>
      <SelectedSkillChips skills={selected} onRemove={skill => onChange(selected.filter(item => item !== skill))} />
    </div>
  );
}

import { Icon } from '@shared/components/atoms/Icon';
import { CONTROL_CLASSES, FIELD_LABEL_CLASSES } from '../../../config/bench.constants';
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
      <label htmlFor="bench-skill-filter" className={FIELD_LABEL_CLASSES}>Skills</label>
      <div className="relative">
      <select
        id="bench-skill-filter"
        value=""
        className={CONTROL_CLASSES}
        onChange={event => event.target.value && onChange([...selected, event.target.value])}
      >
        <option value="">Agregar skill…</option>
        {remaining.map(skill => <option key={skill} value={skill}>{skill}</option>)}
      </select>
      <Icon name="chevron-down" size={16} className="pointer-events-none absolute right-base top-3 text-carbon-gray-100" />
      </div>
      <SelectedSkillChips skills={selected} onRemove={skill => onChange(selected.filter(item => item !== skill))} />
    </div>
  );
}

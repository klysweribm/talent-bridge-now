import { OPPORTUNITY_COPY } from '../../../config/processOpportunity.copy';
import { useSkillDraft } from '../../../hooks/useSkillDraft';
import { SkillChip } from '@shared/components/atoms/SkillChip/SkillChip';

export interface SkillChipsInputProps {
  readonly id:       string;
  readonly label:    string;
  readonly skills:   readonly string[];
  readonly error?:   string;
  readonly hint?:    string;
  readonly maxSkills:      number;
  readonly maxSkillLength: number;
  readonly onChange: (skills: readonly string[]) => void;
  readonly onBlur?:  () => void;
}

export function SkillChipsInput({ id, label, skills, error, hint, maxSkills, maxSkillLength, onChange, onBlur }: SkillChipsInputProps): JSX.Element {
  const { draft, notice, setDraft, onKeyDown, remove } = useSkillDraft(skills, onChange);
  const full = skills.length >= maxSkills;
  const messageId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="flex flex-col gap-sm">
      <label htmlFor={id} className="text-label text-carbon-gray-70">{label}</label>
      <input
        id={id} value={draft} disabled={full} maxLength={maxSkillLength} autoComplete="off"
        aria-invalid={Boolean(error) || undefined} aria-describedby={messageId}
        onChange={event => setDraft(event.target.value)} onKeyDown={onKeyDown} onBlur={onBlur}
        className={`w-full h-10 px-base rounded-none text-body text-carbon-gray-100 bg-carbon-gray-10 border-0 border-b border-carbon-gray-50 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-carbon-blue-60 disabled:bg-carbon-gray-20 ${error ? 'ring-2 ring-inset ring-carbon-red' : ''}`}
      />
      <ul aria-label={OPPORTUNITY_COPY.skillsListLabel} className="flex flex-wrap gap-xs">
        {skills.map(skill => (
          <li key={skill}><SkillChip label={skill} removeLabel={OPPORTUNITY_COPY.removeSkill(skill)} onRemove={() => remove(skill)} /></li>
        ))}
      </ul>
      <span role="status" className="text-label text-carbon-gray-70">{full ? OPPORTUNITY_COPY.skillsLimit(maxSkills) : notice}</span>
      {error && <span id={`${id}-error`} role="alert" className="text-label text-carbon-red">{error}</span>}
      {!error && hint && <span id={`${id}-hint`} className="text-label text-carbon-gray-70">{hint}</span>}
    </div>
  );
}

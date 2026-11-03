import { OPPORTUNITY_LIMITS } from '../../../config/processOpportunity.constants';
import { OPPORTUNITY_COPY } from '../../../config/processOpportunity.copy';
import { useSkillDraft } from '../../../hooks/useSkillDraft';
import { SkillChip } from '@shared/components/atoms/SkillChip/SkillChip';

export interface SkillChipsInputProps {
  readonly id:       string;
  readonly label:    string;
  readonly skills:   readonly string[];
  readonly error?:   string;
  readonly hint?:    string;
  readonly onChange: (skills: readonly string[]) => void;
  readonly onBlur?:  () => void;
}

export function SkillChipsInput({ id, label, skills, error, hint, onChange, onBlur }: SkillChipsInputProps): JSX.Element {
  const { draft, notice, setDraft, onKeyDown, remove } = useSkillDraft(skills, onChange);
  const full = skills.length >= OPPORTUNITY_LIMITS.skillsMax;
  const messageId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="flex flex-col gap-2xs">
      <label htmlFor={id} className="text-body-md font-medium text-text-primary">{label}</label>
      <input
        id={id} value={draft} disabled={full} maxLength={OPPORTUNITY_LIMITS.skillMax} autoComplete="off"
        aria-invalid={Boolean(error) || undefined} aria-describedby={messageId}
        onChange={event => setDraft(event.target.value)} onKeyDown={onKeyDown} onBlur={onBlur}
        className={`w-full h-10 px-sm rounded text-body-md text-text-primary bg-surface-card border focus:outline-2 focus:outline-primary-interactive disabled:bg-surface-low ${error ? 'border-2 border-status-danger' : 'border-[#8d8d8d]'}`}
      />
      <ul aria-label={OPPORTUNITY_COPY.skillsListLabel} className="flex flex-wrap gap-xs">
        {skills.map(skill => (
          <li key={skill}><SkillChip label={skill} removeLabel={OPPORTUNITY_COPY.removeSkill(skill)} onRemove={() => remove(skill)} /></li>
        ))}
      </ul>
      <span role="status" className="text-label-md text-text-secondary">{full ? OPPORTUNITY_COPY.skillsLimit : notice}</span>
      {error && <span id={`${id}-error`} role="alert" className="text-label-md text-status-danger">{error}</span>}
      {!error && hint && <span id={`${id}-hint`} className="text-label-md text-text-secondary">{hint}</span>}
    </div>
  );
}

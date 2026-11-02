import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { FIELD_LABELS } from '../../../config/candidates.constants';
import type { ICandidateFormValues } from '../../../utils/draftMapping';
import { CandidateTextField } from '../CandidateTextField';
import { SeniorityField } from '../SeniorityField';

export interface CandidateFormFieldsProps {
  readonly register: UseFormRegister<ICandidateFormValues>;
  readonly errors: FieldErrors<ICandidateFormValues>;
  readonly missing: ReadonlySet<string>;
}

export function CandidateFormFields({ register, errors, missing }: CandidateFormFieldsProps): JSX.Element {
  const field = (name: keyof typeof FIELD_LABELS, extra: { required?: boolean; label?: string } = {}): JSX.Element => (
    <CandidateTextField
      label={extra.label ?? FIELD_LABELS[name]}
      aria-required={extra.required}
      error={errors[name]?.message}
      missing={missing.has(name)}
      {...register(name)}
    />
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-base">
      {field('fullName', { required: true, label: `${FIELD_LABELS.fullName} *` })}
      {field('email', { required: true, label: `${FIELD_LABELS.email} *` })}
      {field('phone')}
      {field('linkedIn')}
      {field('country')}
      {field('city')}
      {field('primaryRole')}
      <SeniorityField missing={missing.has('seniority')} {...register('seniority')} />
      {field('yearsExperience')}
      {field('skills', { label: `${FIELD_LABELS.skills} (separadas por coma)` })}
      {field('summary')}
    </div>
  );
}

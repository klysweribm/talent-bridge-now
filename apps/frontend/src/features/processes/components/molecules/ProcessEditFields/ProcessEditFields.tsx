import type { BaseSyntheticEvent } from 'react';
import { Button } from '@shared/components/atoms/Button';
import { InputField } from '@shared/components/atoms/InputField';
import { PROCESS_ACTIONS_COPY } from '../../../config/processActions.copy';
import { PROCESS_FIELD_IDS } from '../../../constants/processFieldIds';
import type { IUseProcessEditForm } from '../../../hooks/useProcessEditForm';
import { OpportunityFields } from '../OpportunityFields/OpportunityFields';

export interface ProcessEditFieldsProps {
  readonly form:     IUseProcessEditForm;
  readonly busy:     boolean;
  readonly onSubmit: (event?: BaseSyntheticEvent) => void;
  readonly onCancel: () => void;
}

const COPY = PROCESS_ACTIONS_COPY.edit;

export function ProcessEditFields({ form, busy, onSubmit, onCancel }: ProcessEditFieldsProps): JSX.Element {
  const { values, errors, onTextChange, touchField } = form;
  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-md">
      <InputField id={PROCESS_FIELD_IDS.title} label={COPY.titleLabel} value={values.title} error={errors.title?.message}
        onChange={onTextChange('title')} onBlur={() => touchField('title')} />
      <InputField id={PROCESS_FIELD_IDS.clientName} label={COPY.clientLabel} value={values.clientName} error={errors.clientName?.message}
        onChange={onTextChange('clientName')} onBlur={() => touchField('clientName')} />
      <OpportunityFields bindings={form.opportunity} />
      <div className="flex flex-wrap gap-sm">
        <Button type="submit" className="min-h-11" disabled={busy || !form.canSubmit}>{busy ? COPY.saving : COPY.save}</Button>
        <Button type="button" variant="secondary" className="min-h-11" disabled={busy} onClick={onCancel}>{COPY.cancel}</Button>
      </div>
    </form>
  );
}

import type { ChangeEvent } from 'react';
import { InputField } from '@shared/components/atoms/InputField';
import { OPPORTUNITY_COPY } from '../../../config/processOpportunity.copy';

export interface StartDateFieldProps {
  readonly id:       string;
  readonly value:    string;
  readonly error?:   string | undefined;
  readonly onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly onBlur:   () => void;
}

/** Fecha de inicio opcional de la oportunidad (`YYYY-MM-DD`); sirve para sugerir recursos de la banca disponibles a esa fecha. */
export function StartDateField({ id, value, error, onChange, onBlur }: StartDateFieldProps): JSX.Element {
  return (
    <InputField id={id} type="date" label={OPPORTUNITY_COPY.startDate} value={value} hint={OPPORTUNITY_COPY.startDateHint} error={error} onChange={onChange} onBlur={onBlur} />
  );
}

import type { BaseSyntheticEvent, ChangeEvent } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch, type FieldErrors } from 'react-hook-form';
import { PROCESS_FIELD_IDS } from '../constants/processFieldIds';
import { buildProcessDataSchema, type TProcessDataValues } from '../schemas/processData.schema';
import { noValidation } from './noValidationResolver';
import { useOpportunityLimits } from './useOpportunityLimits';
import { useWizardStore } from '../store/wizard.store';
import type { TProcessCreatorRole } from '../types/processCreate.types';
import { OPPORTUNITY_FIELD_ORDER, buildOpportunityBindings, type IOpportunityBindings, type TOpportunityField } from './opportunityBindings';

export type TProcessTextField = 'title' | 'clientName' | 'ownerPmId' | 'recruiterId';
type TProcessFieldName = TProcessTextField | TOpportunityField;

const FIELD_ORDER: readonly TProcessFieldName[] = ['title', 'clientName', 'ownerPmId', 'recruiterId', ...OPPORTUNITY_FIELD_ORDER];

export interface IUseProcessDataForm {
  readonly values:       Readonly<Record<TProcessTextField, string>>;
  readonly errors:       FieldErrors<TProcessDataValues>;
  readonly opportunity:  IOpportunityBindings;
  /** Cantidad de errores a anunciar; 0 hasta el primer intento de envío. */
  readonly bannerCount:  number;
  readonly setField:     (name: TProcessTextField, value: string) => void;
  readonly onTextChange: (name: TProcessTextField) => (event: ChangeEvent<HTMLInputElement>) => void;
  readonly touchField:   (name: TProcessFieldName) => void;
  readonly onSubmit:     (event?: BaseSyntheticEvent) => void;
  /** Sin los límites del servidor no se valida ni se envía. */
  readonly canSubmit:    boolean;
}

function focusFirstInvalid(invalid: FieldErrors<TProcessDataValues>): void {
  const first = FIELD_ORDER.find(name => invalid[name]);
  if (first) document.getElementById(PROCESS_FIELD_IDS[first])?.focus();
}

export function useProcessDataForm(role: TProcessCreatorRole): IUseProcessDataForm {
  const { limits, limitsView } = useOpportunityLimits();
  const data = useWizardStore(state => state.data);
  const saveData = useWizardStore(state => state.saveData);
  const setStep = useWizardStore(state => state.setStep);
  const defaults = { ...data, skills: [...data.skills], ownerPmId: data.ownerPmId ?? '', recruiterId: data.recruiterId ?? '' };
  const { control, setValue, trigger, handleSubmit, formState: { errors, submitCount } } = useForm<TProcessDataValues>({
    resolver: limits ? zodResolver(buildProcessDataSchema(role, limits)) : noValidation<TProcessDataValues>(),
    mode: 'onBlur',
    defaultValues: defaults,
  });
  const values = { ...defaults, ...useWatch<TProcessDataValues>({ control, defaultValue: defaults }) };

  const submit = handleSubmit(parsed => { saveData({ ...parsed }); setStep('candidates'); }, focusFirstInvalid);
  const setField = (name: TProcessTextField, value: string): void => setValue(name, value, { shouldValidate: Boolean(errors[name]) });
  const opportunity = buildOpportunityBindings(
    values, errors,
    (name, value, validate) => setValue(name, value as never, { shouldValidate: validate }),
    name => { void trigger(name); },
    limitsView,
  );

  return {
    values, errors, opportunity, setField,
    bannerCount: submitCount > 0 ? Object.keys(errors).length : 0,
    touchField: name => { void trigger(name); },
    onTextChange: name => event => setField(name, event.target.value),
    canSubmit: limits !== undefined,
    onSubmit: event => { if (limits) void submit(event); else event?.preventDefault(); },
  };
}

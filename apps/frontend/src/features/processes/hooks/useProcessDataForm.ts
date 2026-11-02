import type { BaseSyntheticEvent, ChangeEvent } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch, type FieldErrors } from 'react-hook-form';
import { PROCESS_FIELD_IDS } from '../constants/processFieldIds';
import { buildProcessDataSchema, type TProcessDataValues } from '../schemas/processData.schema';
import { useWizardStore } from '../store/wizard.store';
import type { TProcessCreatorRole } from '../types/processCreate.types';

export type TProcessFieldName = keyof TProcessDataValues;

const FIELD_ORDER: readonly TProcessFieldName[] = ['title', 'clientName', 'ownerPmId', 'recruiterId'];

export interface IUseProcessDataForm {
  readonly values:       Readonly<Record<TProcessFieldName, string>>;
  readonly errors:       FieldErrors<TProcessDataValues>;
  /** Cantidad de errores a anunciar; 0 hasta el primer intento de envío. */
  readonly bannerCount:  number;
  readonly setField:     (name: TProcessFieldName, value: string) => void;
  readonly onTextChange: (name: TProcessFieldName) => (event: ChangeEvent<HTMLInputElement>) => void;
  readonly touchField:   (name: TProcessFieldName) => void;
  readonly onSubmit:     (event?: BaseSyntheticEvent) => void;
}

export function useProcessDataForm(role: TProcessCreatorRole): IUseProcessDataForm {
  const data = useWizardStore(state => state.data);
  const saveData = useWizardStore(state => state.saveData);
  const setStep = useWizardStore(state => state.setStep);
  const defaults: Record<TProcessFieldName, string> = {
    title: data.title, clientName: data.clientName, ownerPmId: data.ownerPmId ?? '', recruiterId: data.recruiterId ?? '',
  };
  const { control, setValue, trigger, handleSubmit, formState: { errors, submitCount } } = useForm<TProcessDataValues>({
    resolver: zodResolver(buildProcessDataSchema(role)),
    mode: 'onBlur',
    defaultValues: defaults,
  });
  const watched = useWatch({ control, defaultValue: defaults });
  const values: Record<TProcessFieldName, string> = { ...defaults, ...watched };

  const focusFirstInvalid = (invalid: FieldErrors<TProcessDataValues>): void => {
    const first = FIELD_ORDER.find(name => invalid[name]);
    if (first) document.getElementById(PROCESS_FIELD_IDS[first])?.focus();
  };
  const submit = handleSubmit(parsed => { saveData(parsed); setStep('candidates'); }, focusFirstInvalid);
  const setField = (name: TProcessFieldName, value: string): void =>
    setValue(name, value, { shouldValidate: Boolean(errors[name]) });

  return {
    values, errors,
    bannerCount: submitCount > 0 ? Object.keys(errors).length : 0,
    setField,
    onTextChange: name => event => setField(name, event.target.value),
    touchField: name => { void trigger(name); },
    onSubmit: event => { void submit(event); },
  };
}

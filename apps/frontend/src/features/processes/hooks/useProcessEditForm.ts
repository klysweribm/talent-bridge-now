import type { BaseSyntheticEvent, ChangeEvent } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch, type FieldErrors } from 'react-hook-form';
import { PROCESS_FIELD_IDS } from '../constants/processFieldIds';
import { processEditSchema, type TProcessEditValues } from '../schemas/processEdit.schema';

export type TProcessEditField = keyof TProcessEditValues;

export interface IUseProcessEditForm {
  readonly values:       TProcessEditValues;
  readonly errors:       FieldErrors<TProcessEditValues>;
  readonly onTextChange: (name: TProcessEditField) => (event: ChangeEvent<HTMLInputElement>) => void;
  readonly touchField:   (name: TProcessEditField) => void;
  readonly onSubmit:     (event?: BaseSyntheticEvent) => void;
}

/** react-hook-form + zod para editar título y cliente; `onValid` recibe los valores ya recortados. */
export function useProcessEditForm(initial: TProcessEditValues, onValid: (values: TProcessEditValues) => void): IUseProcessEditForm {
  const { control, setValue, trigger, handleSubmit, formState: { errors } } = useForm<TProcessEditValues>({
    resolver: zodResolver(processEditSchema),
    mode: 'onBlur',
    defaultValues: initial,
  });
  const values = { ...initial, ...useWatch({ control, defaultValue: initial }) };
  const submit = handleSubmit(onValid, invalid => {
    const first = (['title', 'clientName'] as const).find(name => invalid[name]);
    if (first) document.getElementById(PROCESS_FIELD_IDS[first])?.focus();
  });
  return {
    values,
    errors,
    onTextChange: name => event => setValue(name, event.target.value, { shouldValidate: Boolean(errors[name]) }),
    touchField: name => { void trigger(name); },
    onSubmit: event => { void submit(event); },
  };
}

import type { BaseSyntheticEvent, ChangeEvent } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch, type FieldErrors } from 'react-hook-form';
import { PROCESS_FIELD_IDS } from '../constants/processFieldIds';
import { processEditSchema, type TProcessEditValues } from '../schemas/processEdit.schema';
import { OPPORTUNITY_FIELD_ORDER, buildOpportunityBindings, type IOpportunityBindings } from './opportunityBindings';

export type TProcessEditField = 'title' | 'clientName';

/** Valores iniciales: `band` puede faltar en procesos legacy (el esquema lo exige al guardar). */
export type TProcessEditInitial = Omit<TProcessEditValues, 'band' | 'skills'> & { readonly band: number | undefined; readonly skills: readonly string[] };

export interface IUseProcessEditForm {
  readonly values:       TProcessEditInitial;
  readonly errors:       FieldErrors<TProcessEditValues>;
  readonly opportunity:  IOpportunityBindings;
  readonly onTextChange: (name: TProcessEditField) => (event: ChangeEvent<HTMLInputElement>) => void;
  readonly touchField:   (name: TProcessEditField) => void;
  readonly onSubmit:     (event?: BaseSyntheticEvent) => void;
}

const FIELD_ORDER = ['title', 'clientName', ...OPPORTUNITY_FIELD_ORDER] as const;

/** react-hook-form + zod para editar el proceso; `onValid` recibe los valores ya recortados. */
export function useProcessEditForm(initial: TProcessEditInitial, onValid: (values: TProcessEditValues) => void): IUseProcessEditForm {
  const { control, setValue, trigger, handleSubmit, formState: { errors } } = useForm<TProcessEditValues>({
    resolver: zodResolver(processEditSchema),
    mode: 'onBlur',
    defaultValues: { ...initial, skills: [...initial.skills] },
  });
  const values: TProcessEditInitial = { ...initial, ...useWatch<TProcessEditValues>({ control, defaultValue: { ...initial, skills: [...initial.skills] } }) };
  const submit = handleSubmit(onValid, invalid => {
    const first = FIELD_ORDER.find(name => invalid[name]);
    if (first) document.getElementById(PROCESS_FIELD_IDS[first])?.focus();
  });
  const opportunity = buildOpportunityBindings(
    values, errors,
    (name, value, validate) => setValue(name, value as never, { shouldValidate: validate }),
    name => { void trigger(name); },
  );
  return {
    values,
    errors,
    opportunity,
    onTextChange: name => event => setValue(name, event.target.value, { shouldValidate: Boolean(errors[name]) }),
    touchField: name => { void trigger(name); },
    onSubmit: event => { void submit(event); },
  };
}

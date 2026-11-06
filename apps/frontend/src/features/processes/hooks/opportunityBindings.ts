import type { ChangeEvent } from 'react';
import type { IOpportunityLimits } from '@ibm-talent-bridge/shared-types';

export type TOpportunityField = 'opportunityRole' | 'skills' | 'band' | 'startDate' | 'roleDescription';

export interface IOpportunityValues {
  readonly opportunityRole: string;
  readonly skills:          readonly string[];
  readonly roleDescription: string;
  readonly band?:           number | undefined;
  readonly startDate?:      string | undefined;
}

/** Estado de los límites del servidor (server state) que necesitan los campos: sin `data` no hay nada que validar ni mostrar. */
export interface IOpportunityLimitsView {
  readonly data?:  IOpportunityLimits | undefined;
  readonly failed: boolean;
  readonly retry:  () => void;
}

/** Contrato que reciben `OpportunityFields` y los dos formularios que lo usan (creación y edición). */
export interface IOpportunityBindings {
  readonly values:        IOpportunityValues;
  readonly errors:        Readonly<Partial<Record<TOpportunityField, string>>>;
  readonly onRole:        (event: ChangeEvent<HTMLInputElement>) => void;
  readonly onDescription: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  readonly onSkills:      (skills: readonly string[]) => void;
  readonly onBand:        (band: number) => void;
  readonly onStartDate:   (event: ChangeEvent<HTMLInputElement>) => void;
  readonly touch:         (name: TOpportunityField) => void;
  readonly limits:        IOpportunityLimitsView;
}

/** Forma mínima de los errores de react-hook-form que necesita este módulo (sirve para ambos formularios). */
type TFieldIssue = { readonly message?: string; readonly root?: { readonly message?: string } } | undefined;
export type TOpportunityIssues = Readonly<Partial<Record<TOpportunityField, TFieldIssue>>>;

export type TSetOpportunity = (name: TOpportunityField, value: string | number | string[], validate: boolean) => void;

export function buildOpportunityBindings(
  values: IOpportunityValues, issues: TOpportunityIssues, set: TSetOpportunity, touch: (name: TOpportunityField) => void,
  limits: IOpportunityLimitsView,
): IOpportunityBindings {
  const errors = {
    opportunityRole: issues.opportunityRole?.message,
    skills:          issues.skills?.message ?? issues.skills?.root?.message,
    roleDescription: issues.roleDescription?.message,
    band:            issues.band?.message,
    startDate:       issues.startDate?.message,
  };
  return {
    values, errors, touch, limits,
    onRole:        event => set('opportunityRole', event.target.value, Boolean(errors.opportunityRole)),
    onDescription: event => set('roleDescription', event.target.value, Boolean(errors.roleDescription)),
    // Agregar/quitar una tecnología o elegir una banda es una decisión explícita: se valida al instante.
    onSkills:      skills => set('skills', [...skills], true),
    onBand:        band => set('band', band, true),
    onStartDate:   event => set('startDate', event.target.value, Boolean(errors.startDate)),
  };
}

/** Orden visual de los campos de la oportunidad, para enfocar el primero inválido. */
export const OPPORTUNITY_FIELD_ORDER: readonly TOpportunityField[] = ['opportunityRole', 'skills', 'band', 'startDate', 'roleDescription'];

import { FIELD_LABELS, MISSING_FIELD_TO_FORM_FIELD } from '../config/candidates.constants';

export interface IResolvedMissing {
  /** Campos del formulario a resaltar. */
  readonly formFields: ReadonlySet<string>;
  /** Etiquetas legibles para el aviso (los campos sin control propio se muestran tal cual). */
  readonly labels: readonly string[];
}

export function resolveMissing(missingFields: readonly string[]): IResolvedMissing {
  const formFields = new Set<string>();
  const labels = missingFields.map(field => {
    const formField = MISSING_FIELD_TO_FORM_FIELD[field];
    if (!formField) return field;
    formFields.add(formField);
    return FIELD_LABELS[formField];
  });
  return { formFields, labels: Array.from(new Set(labels)) };
}

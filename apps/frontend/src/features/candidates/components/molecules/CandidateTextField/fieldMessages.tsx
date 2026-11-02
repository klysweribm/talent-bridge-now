import { MISSING_HINT } from './missingHint';

export interface IFieldMessagesProps {
  readonly id: string;
  readonly error?: string;
  readonly hint?: string;
  readonly missing?: boolean;
}

/** Ids de los mensajes visibles de un campo, en orden de prioridad: error, ayuda, "no detectado". */
export function describedBy({ id, error, hint, missing }: IFieldMessagesProps): string | undefined {
  if (error) return `${id}-error`;
  if (hint) return `${id}-help`;
  return missing ? `${id}-hint` : undefined;
}

/** Un solo mensaje bajo el campo: el error manda sobre la ayuda y la ayuda sobre el aviso de "no detectado". */
export function FieldMessages({ id, error, hint, missing }: IFieldMessagesProps): JSX.Element | null {
  if (error) return <span id={`${id}-error`} role="alert" className="text-label-md text-status-danger">{error}</span>;
  if (hint) return <span id={`${id}-help`} className="text-label-md text-text-secondary">{hint}</span>;
  if (missing) return <span id={`${id}-hint`} className="text-label-md text-text-secondary">{MISSING_HINT}</span>;
  return null;
}

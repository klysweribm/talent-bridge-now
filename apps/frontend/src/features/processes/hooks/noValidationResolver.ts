import type { FieldValues, Resolver } from 'react-hook-form';

/** Sin límites del servidor no hay reglas que aplicar; el envío está bloqueado aparte y el backend sigue siendo la autoridad. */
export function noValidation<T extends FieldValues>(): Resolver<T> {
  return () => ({ values: {}, errors: {} });
}

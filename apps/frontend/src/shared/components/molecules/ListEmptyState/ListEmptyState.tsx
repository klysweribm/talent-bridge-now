import type { ReactNode } from 'react';
import { Button } from '@shared/components/atoms/Button';

export interface ListEmptyStateProps {
  /** Texto principal del estado vacío. */
  readonly message:       string;
  /** Etiqueta del botón de acción; sin ella (o sin `onAction`) no se muestra botón. */
  readonly actionLabel?:  string;
  readonly onAction?:     () => void;
  /** Acción personalizada (p. ej. un enlace) mostrada tras el mensaje. */
  readonly children?:     ReactNode;
}

export function ListEmptyState({ message, actionLabel, onAction, children }: ListEmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-md py-2xl text-center">
      <p className="text-body-lg text-text-secondary">{message}</p>
      {actionLabel && onAction && <Button variant="secondary" onClick={onAction}>{actionLabel}</Button>}
      {children}
    </div>
  );
}

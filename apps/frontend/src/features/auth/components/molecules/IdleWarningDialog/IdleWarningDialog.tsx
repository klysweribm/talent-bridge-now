import type { JSX } from 'react';
import { ModalDialog } from '@shared/components/molecules/ModalDialog';

export interface IdleWarningDialogProps {
  readonly secondsLeft: number;
  readonly onStay: () => void;
  readonly onLogout: () => void;
}

/** Diálogo de aviso de inactividad (presentacional, solo props). */
export function IdleWarningDialog({ secondsLeft, onStay, onLogout }: IdleWarningDialogProps): JSX.Element {
  return (
    <ModalDialog
      titleId="idle-warning-title" descId="idle-warning-desc" title="¿Sigues ahí?"
      cancelLabel="Cerrar sesión" onCancel={onLogout} confirmLabel="Seguir conectado" onConfirm={onStay}
    >
      Por inactividad, tu sesión se cerrará en <strong aria-live="polite">{secondsLeft} s</strong>.
    </ModalDialog>
  );
}

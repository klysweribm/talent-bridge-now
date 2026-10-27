import type { JSX } from 'react';
import { Button } from '@shared/components/atoms/Button';
import { Icon } from '@shared/components/atoms/Icon';

export interface IdleWarningDialogProps {
  readonly secondsLeft: number;
  readonly onStay: () => void;
  readonly onLogout: () => void;
}

/** Diálogo de aviso de inactividad (presentacional, solo props). */
export function IdleWarningDialog({ secondsLeft, onStay, onLogout }: IdleWarningDialogProps): JSX.Element {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="idle-warning-title"
      aria-describedby="idle-warning-desc"
      className="w-full max-w-[420px] rounded-lg bg-surface-card p-xl flex flex-col gap-base shadow-modal"
    >
      <span className="w-12 h-12 rounded-full bg-status-warning-bg flex items-center justify-center text-text-primary">
        <Icon name="error" size={24} />
      </span>
      <h2 id="idle-warning-title" className="text-headline-md text-text-primary">¿Sigues ahí?</h2>
      <p id="idle-warning-desc" className="text-body-md text-text-secondary">
        Por inactividad, tu sesión se cerrará en <strong aria-live="polite">{secondsLeft} s</strong>.
      </p>
      <div className="flex justify-end gap-sm">
        <Button variant="secondary" onClick={onLogout}>Cerrar sesión</Button>
        <Button autoFocus onClick={onStay}>Seguir conectado</Button>
      </div>
    </div>
  );
}

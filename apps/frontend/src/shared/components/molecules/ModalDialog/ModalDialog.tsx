import type { KeyboardEvent, ReactNode } from 'react';
import { Button, type ButtonVariant } from '@shared/components/atoms/Button';

export interface ModalDialogProps {
  readonly titleId:       string;
  readonly descId:        string;
  readonly title:         string;
  /** Etiqueta de 12px sobre el título (opcional). */
  readonly eyebrow?:      string;
  readonly children:      ReactNode;
  readonly cancelLabel:   string;
  readonly onCancel:      () => void;
  readonly confirmLabel:  string;
  readonly onConfirm:     () => void;
  /** `danger` para acciones destructivas; por defecto `primary`. */
  readonly confirmVariant?: Extract<ButtonVariant, 'primary' | 'danger'>;
  readonly onKeyDown?:    (event: KeyboardEvent<HTMLDivElement>) => void;
}

/** Diálogo de confirmación del prototipo: 480px, sin radio, pie con dos botones de 64px. El foco inicial va a la acción. */
export function ModalDialog(props: ModalDialogProps): JSX.Element {
  const { titleId, descId, title, eyebrow, children, cancelLabel, onCancel, confirmLabel, onConfirm, confirmVariant = 'primary', onKeyDown } = props;
  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-scrim p-base">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onKeyDown={onKeyDown}
        className="flex w-full max-w-[480px] flex-col bg-white shadow-modal"
      >
        <div className="flex flex-col gap-sm p-base pb-12">
          {eyebrow && <span className="text-label text-carbon-gray-70">{eyebrow}</span>}
          <h2 id={titleId} className="text-h3 text-carbon-gray-100">{title}</h2>
          <div id={descId} className="text-body text-carbon-gray-70">{children}</div>
        </div>
        <div className="flex">
          <Button variant="secondary" size="xl" className="flex-1" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant={confirmVariant} size="xl" className="flex-1" autoFocus onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}

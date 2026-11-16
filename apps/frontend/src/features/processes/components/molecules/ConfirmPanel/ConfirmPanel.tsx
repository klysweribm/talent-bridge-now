import { useEffect, useRef } from 'react';
import { Button } from '@shared/components/atoms/Button';

export interface ConfirmPanelProps {
  readonly title:        string;
  readonly message:      string;
  readonly confirmLabel: string;
  readonly cancelLabel:  string;
  readonly busyLabel:    string;
  readonly busy:         boolean;
  readonly onConfirm:    () => void;
  readonly onCancel:     () => void;
}

/** Confirmación en línea (sin modal): al aparecer recibe el foco para que el lector de pantalla lo anuncie. */
export function ConfirmPanel({ title, message, confirmLabel, cancelLabel, busyLabel, busy, onConfirm, onCancel }: ConfirmPanelProps): JSX.Element {
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => { panelRef.current?.focus(); }, []);
  return (
    <section ref={panelRef} tabIndex={-1} role="group" aria-labelledby="confirm-panel-title" className="flex flex-col gap-sm p-base focus:outline-none border-l-[3px] border-carbon-red bg-carbon-red-10">
      <h2 id="confirm-panel-title" className="text-h2 text-carbon-gray-100">{title}</h2>
      <p className="text-body text-carbon-gray-70">{message}</p>
      <div className="flex flex-wrap gap-sm">
        <Button type="button" variant="outline" disabled={busy} onClick={onCancel}>{cancelLabel}</Button>
        <Button type="button" disabled={busy} onClick={onConfirm}>{busy ? busyLabel : confirmLabel}</Button>
      </div>
    </section>
  );
}

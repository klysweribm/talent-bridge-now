import type { ReactNode } from 'react';
import { Button } from '@shared/components/atoms/Button';

export interface ConfirmSectionProps {
  readonly title:     string;
  readonly editLabel: string;
  readonly onEdit:    () => void;
  readonly disabled:  boolean;
  readonly children:  ReactNode;
}

export function ConfirmSection({ title, editLabel, onEdit, disabled, children }: ConfirmSectionProps): JSX.Element {
  return (
    <section className="flex flex-col gap-md p-base border border-carbon-gray-20 bg-white">
      <div className="flex items-center justify-between gap-md">
        <h3 className="text-h2 text-carbon-gray-100">{title}</h3>
        <Button variant="ghost" size="sm" disabled={disabled} onClick={onEdit} aria-label={`${editLabel} ${title}`}>{editLabel}</Button>
      </div>
      {children}
    </section>
  );
}

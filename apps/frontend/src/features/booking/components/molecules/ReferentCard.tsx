import type { JSX } from 'react';
import { BOOKING_COPY } from '../../config/booking.copy';
import type { IReferent } from '../../types/booking.types';

export interface ReferentCardProps {
  readonly referent: IReferent;
  readonly freeHours: number;
  readonly onSelect: () => void;
}

export function ReferentCard({ referent, freeHours, onSelect }: ReferentCardProps): JSX.Element {
  return (
    <button type="button" onClick={onSelect}
      className="flex flex-col gap-xs rounded-lg bg-surface-card p-base text-left shadow-card hover:bg-surface-low">
      <span className="text-title-md text-text-primary">{referent.name}</span>
      <span className="text-body-md text-text-secondary">{referent.profile}</span>
      <span className={`text-body-md-medium ${freeHours > 0 ? 'text-primary-interactive' : 'text-text-secondary'}`}>
        {freeHours > 0 ? BOOKING_COPY.hoursFree(freeHours) : BOOKING_COPY.noHours}
      </span>
    </button>
  );
}

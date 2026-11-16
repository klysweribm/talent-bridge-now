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
      className="flex flex-col gap-xs border border-carbon-gray-20 bg-white p-base text-left hover:bg-carbon-gray-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-carbon-blue-60">
      <span className="text-h2 text-carbon-gray-100">{referent.name}</span>
      <span className="text-body text-carbon-gray-70">{referent.profile}</span>
      <span className={`text-body font-semibold ${freeHours > 0 ? 'text-carbon-blue-60' : 'text-carbon-gray-70'}`}>
        {freeHours > 0 ? BOOKING_COPY.hoursFree(freeHours) : BOOKING_COPY.noHours}
      </span>
    </button>
  );
}

import type { JSX } from 'react';
import { BOOKING_COPY } from '../../config/booking.copy';
import type { IAvailabilitySlot, TCalendarMode } from '../../types/booking.types';

export interface SlotCellProps {
  readonly mode: TCalendarMode;
  readonly slot?: IAvailabilitySlot;
  readonly dayHourLabel: string;
  readonly onAdd: () => void;
  readonly onRemove: () => void;
  readonly onBook: () => void;
}

const BASE = 'h-10 px-xs text-label transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-carbon-blue-60';

export function SlotCell({ mode, slot, dayHourLabel, onAdd, onRemove, onBook }: SlotCellProps): JSX.Element {
  if (slot?.bookedBy !== undefined) {
    return (
      <div className={`${BASE} flex items-center justify-center border border-carbon-gray-20 bg-carbon-gray-20 text-center text-carbon-gray-70`}>
        {BOOKING_COPY.bookedBy(slot.bookedBy)}
      </div>
    );
  }
  if (slot) {
    return mode === 'edit' ? (
      <button type="button" aria-label={BOOKING_COPY.removeAria(...parts(dayHourLabel))} onClick={onRemove}
        className={`${BASE} border border-carbon-gray-20 bg-carbon-blue-10 text-carbon-blue-80 hover:bg-carbon-blue-20`}>
        {BOOKING_COPY.free}
      </button>
    ) : (
      <button type="button" aria-label={BOOKING_COPY.bookAria(...parts(dayHourLabel))} onClick={onBook}
        className={`${BASE} border border-carbon-gray-20 bg-carbon-blue-10 text-carbon-blue-80 hover:bg-carbon-gray-100 hover:text-white`}>
        {BOOKING_COPY.book}
      </button>
    );
  }
  return mode === 'edit' ? (
    <button type="button" aria-label={BOOKING_COPY.addAria(...parts(dayHourLabel))} onClick={onAdd}
      className={`${BASE} border border-carbon-gray-20 bg-white hover:bg-carbon-gray-hover`} />
  ) : (
    <div className={`${BASE} border border-carbon-gray-20 bg-carbon-gray-10`} />
  );
}

function parts(label: string): [string, string] {
  const [day, hour] = label.split(' ');
  return [day, hour];
}

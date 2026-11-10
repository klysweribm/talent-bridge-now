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

const BASE = 'h-10 rounded-md px-xs text-label-sm transition-colors';

export function SlotCell({ mode, slot, dayHourLabel, onAdd, onRemove, onBook }: SlotCellProps): JSX.Element {
  if (slot?.bookedBy !== undefined) {
    return (
      <div className={`${BASE} flex items-center justify-center bg-surface-high text-center text-text-secondary`}>
        {BOOKING_COPY.bookedBy(slot.bookedBy)}
      </div>
    );
  }
  if (slot) {
    return mode === 'edit' ? (
      <button type="button" aria-label={BOOKING_COPY.removeAria(...parts(dayHourLabel))} onClick={onRemove}
        className={`${BASE} bg-primary-fixed text-primary-on-fixed hover:bg-primary-fixed-dim`}>
        {BOOKING_COPY.free}
      </button>
    ) : (
      <button type="button" aria-label={BOOKING_COPY.bookAria(...parts(dayHourLabel))} onClick={onBook}
        className={`${BASE} bg-primary-interactive text-primary-on hover:bg-primary-container`}>
        {BOOKING_COPY.book}
      </button>
    );
  }
  return mode === 'edit' ? (
    <button type="button" aria-label={BOOKING_COPY.addAria(...parts(dayHourLabel))} onClick={onAdd}
      className={`${BASE} border border-outline-variant bg-surface-card hover:bg-surface-low`} />
  ) : (
    <div className={`${BASE} bg-surface-low`} />
  );
}

function parts(label: string): [string, string] {
  const [day, hour] = label.split(' ');
  return [day, hour];
}

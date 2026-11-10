import type { JSX } from 'react';
import { BOOKING_COPY } from '../../config/booking.copy';
import { DAY_LABELS, END_HOUR, START_HOUR } from '../../config/booking.constants';
import type { IAvailabilitySlot, TCalendarMode } from '../../types/booking.types';
import { SlotCell } from '../atoms/SlotCell';

export interface WeekCalendarProps {
  readonly weekDates: readonly string[];
  readonly slots: readonly IAvailabilitySlot[];
  readonly mode: TCalendarMode;
  readonly onAdd?: (date: string, hour: number) => void;
  readonly onRemove?: (slotId: string) => void;
  readonly onBook?: (slotId: string) => void;
}

const HOURS: readonly number[] = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
const fmt = (h: number): string => `${String(h).padStart(2, '0')}:00`;

interface IHourRowProps extends Omit<WeekCalendarProps, never> {
  readonly hour: number;
}

function HourRow({ hour: h, weekDates, slots, mode, onAdd, onRemove, onBook }: IHourRowProps): JSX.Element {
  return (
    <div className="contents">
      <div className="text-label-sm text-text-secondary self-center">{fmt(h)}</div>
      {weekDates.map((date, i) => {
        const slot = slots.find(s => s.date === date && s.startHour === h);
        return (
          <SlotCell key={date} mode={mode} slot={slot} dayHourLabel={`${DAY_LABELS[i]} ${fmt(h)}`}
            onAdd={() => onAdd?.(date, h)} onRemove={() => slot && onRemove?.(slot.id)}
            onBook={() => slot && onBook?.(slot.id)} />
        );
      })}
    </div>
  );
}

export function WeekCalendar(props: WeekCalendarProps): JSX.Element {
  const { weekDates, mode } = props;
  const rest = props;
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[480px] grid-cols-[3rem_repeat(5,minmax(0,1fr))] gap-xs" role="grid">
        <div />
        {DAY_LABELS.map((d, i) => (
          <div key={d} className="text-center text-label-md text-text-secondary">{d} {weekDates[i].slice(8)}</div>
        ))}
        {HOURS.map(h => <HourRow key={h} hour={h} {...rest} />)}
      </div>
      {mode === 'edit' && <p className="mt-md text-label-md text-text-secondary">{BOOKING_COPY.hint}</p>}
    </div>
  );
}

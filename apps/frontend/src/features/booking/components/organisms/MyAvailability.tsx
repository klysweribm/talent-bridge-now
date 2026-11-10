import type { JSX } from 'react';
import { useAuthStore } from '@features/auth/store/auth.store';
import { BOOKING_COPY } from '../../config/booking.copy';
import { getWeekDates } from '../../config/booking.constants';
import { useBookingStore } from '../../store/booking.store';
import { WeekCalendar } from '../molecules/WeekCalendar';

export function MyAvailability(): JSX.Element {
  const email = useAuthStore(s => s.user?.email ?? '');
  const slots = useBookingStore(s => s.slots);
  const addSlot = useBookingStore(s => s.addSlot);
  const removeSlot = useBookingStore(s => s.removeSlot);
  const mine = slots.filter(s => s.referentId === email);
  const free = mine.filter(s => s.bookedBy === undefined).length;

  return (
    <section className="flex flex-col gap-base">
      <h1 className="text-headline-md text-text-primary">{BOOKING_COPY.myTitle}</h1>
      <p className="text-body-lg text-text-secondary">{BOOKING_COPY.hoursSummary(free)}</p>
      <div className="rounded-lg bg-surface-card p-base">
        <WeekCalendar weekDates={getWeekDates()} slots={mine} mode="edit"
          onAdd={(date, h) => addSlot(email, date, h)} onRemove={removeSlot} />
      </div>
    </section>
  );
}

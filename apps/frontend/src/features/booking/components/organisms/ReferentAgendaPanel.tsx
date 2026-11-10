import type { JSX } from 'react';
import { useAuthStore } from '@features/auth/store/auth.store';
import { SidePanel } from '@shared/components/organisms/SidePanel/SidePanel';
import { BOOKING_COPY } from '../../config/booking.copy';
import { getWeekDates } from '../../config/booking.constants';
import { useBookingStore } from '../../store/booking.store';
import type { IReferent } from '../../types/booking.types';
import { WeekCalendar } from '../molecules/WeekCalendar';

export interface ReferentAgendaPanelProps {
  readonly referent: IReferent;
  readonly onClose: () => void;
}

export function ReferentAgendaPanel({ referent, onClose }: ReferentAgendaPanelProps): JSX.Element {
  const recruiter = useAuthStore(s => s.user?.name ?? '');
  const slots = useBookingStore(s => s.slots).filter(s => s.referentId === referent.id);
  const bookSlot = useBookingStore(s => s.bookSlot);
  const free = slots.filter(s => s.bookedBy === undefined).length;

  return (
    <SidePanel title={BOOKING_COPY.panelTitle(referent.name)} titleId="booking-panel-title" width="lg"
      closeLabel={BOOKING_COPY.panelClose} onClose={onClose}>
      <p className="mb-base text-body-md text-text-secondary">
        {free > 0 ? BOOKING_COPY.hoursFree(free) : BOOKING_COPY.noHours}
      </p>
      <WeekCalendar weekDates={getWeekDates()} slots={slots} mode="view" onBook={(id) => bookSlot(id, recruiter)} />
    </SidePanel>
  );
}

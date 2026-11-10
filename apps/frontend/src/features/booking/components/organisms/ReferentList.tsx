import { useState, type JSX } from 'react';
import { BOOKING_COPY } from '../../config/booking.copy';
import { REFERENTS } from '../../config/booking.constants';
import { useBookingStore } from '../../store/booking.store';
import { ReferentCard } from '../molecules/ReferentCard';
import { ReferentAgendaPanel } from './ReferentAgendaPanel';

export function ReferentList(): JSX.Element {
  const slots = useBookingStore(s => s.slots);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const visible = REFERENTS.filter(r => r.name.toLowerCase().includes(query.trim().toLowerCase()));
  const selected = REFERENTS.find(r => r.id === selectedId);

  return (
    <section className="flex flex-col gap-base">
      <h1 className="text-headline-md text-text-primary">{BOOKING_COPY.listTitle}</h1>
      <input type="search" value={query} onChange={e => setQuery(e.target.value)}
        aria-label={BOOKING_COPY.searchLabel} placeholder={BOOKING_COPY.searchPlaceholder}
        className="w-full max-w-sm rounded-md border border-outline-field bg-surface-card px-md py-sm text-body-md" />
      {visible.length === 0 && <p className="text-body-md text-text-secondary">{BOOKING_COPY.noMatches}</p>}
      <div className="grid gap-base sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(r => (
          <ReferentCard key={r.id} referent={r} onSelect={() => setSelectedId(r.id)}
            freeHours={slots.filter(s => s.referentId === r.id && s.bookedBy === undefined).length} />
        ))}
      </div>
      {selected && <ReferentAgendaPanel referent={selected} onClose={() => setSelectedId(null)} />}
    </section>
  );
}

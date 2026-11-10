import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { buildSeedSlots, STORAGE_KEY } from '../config/booking.constants';
import type { IAvailabilitySlot } from '../types/booking.types';

interface IBookingState {
  readonly slots: readonly IAvailabilitySlot[];
}

interface IBookingActions {
  addSlot: (referentId: string, date: string, startHour: number) => void;
  removeSlot: (slotId: string) => void;
  bookSlot: (slotId: string, recruiterName: string) => void;
  releaseSlot: (slotId: string) => void;
}

export const useBookingStore = create<IBookingState & IBookingActions>()(
  persist(
    (set) => ({
      slots: buildSeedSlots(),

      addSlot: (referentId, date, startHour) =>
        set((s) => {
          const exists = s.slots.some(x => x.referentId === referentId && x.date === date && x.startHour === startHour);
          if (exists) return s;
          const slot: IAvailabilitySlot = {
            id: `${referentId}-${date}-${startHour}`, referentId, date, startHour, endHour: startHour + 1,
          };
          return { slots: [...s.slots, slot] };
        }),

      removeSlot: (slotId) =>
        set((s) => ({ slots: s.slots.filter(x => x.id !== slotId || x.bookedBy !== undefined) })),

      bookSlot: (slotId, recruiterName) =>
        set((s) => ({
          slots: s.slots.map(x => (x.id === slotId && x.bookedBy === undefined ? { ...x, bookedBy: recruiterName } : x)),
        })),

      releaseSlot: (slotId) =>
        set((s) => ({ slots: s.slots.map(x => (x.id === slotId ? { ...x, bookedBy: undefined } : x)) })),
    }),
    { name: STORAGE_KEY, storage: createJSONStorage(() => sessionStorage) },
  ),
);

import { useBookingStore } from './booking.store';

const get = (): ReturnType<typeof useBookingStore.getState> => useBookingStore.getState();

describe('useBookingStore', () => {
  beforeEach(() => useBookingStore.setState({ slots: [] }));

  it('should add and remove a slot', () => {
    get().addSlot('r1', '2026-11-09', 10);
    expect(get().slots).toHaveLength(1);
    get().removeSlot(get().slots[0].id);
    expect(get().slots).toHaveLength(0);
  });

  it('should not double book nor remove a booked slot', () => {
    get().addSlot('r1', '2026-11-09', 10);
    const id = get().slots[0].id;
    get().bookSlot(id, 'Ana');
    get().bookSlot(id, 'Otra');
    expect(get().slots[0].bookedBy).toBe('Ana');
    get().removeSlot(id);
    expect(get().slots).toHaveLength(1);
    get().releaseSlot(id);
    expect(get().slots[0].bookedBy).toBeUndefined();
  });
});

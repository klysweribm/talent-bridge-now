export interface IAvailabilitySlot {
  readonly id: string;
  readonly referentId: string;
  /** YYYY-MM-DD */
  readonly date: string;
  readonly startHour: number;
  readonly endHour: number;
  readonly bookedBy?: string;
}

export interface IReferent {
  readonly id: string;
  readonly name: string;
  readonly profile: string;
}

export type TCalendarMode = 'edit' | 'view';

import type { IAvailabilitySlot, IReferent } from '../types/booking.types';

export const DEMO_REFERENT_EMAIL = 'carlos@ibm.com';
export const START_HOUR = 8;
export const END_HOUR = 18;
export const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'] as const;
export const STORAGE_KEY = 'ibm-talent-bridge-booking';

export const REFERENTS: readonly IReferent[] = [
  { id: DEMO_REFERENT_EMAIL, name: 'Carlos Londoño', profile: 'Arquitecto Cloud · Java, Kubernetes' },
  { id: 'lucia.fernandez@ibm.com', name: 'Lucía Fernández', profile: 'Tech Lead · React, TypeScript' },
  { id: 'martin.silva@ibm.com', name: 'Martín Silva', profile: 'Data Engineer · Python, Spark' },
  { id: 'valeria.rojas@ibm.com', name: 'Valeria Rojas', profile: 'QA Lead · Automatización, Cypress' },
];

/** [índice de día lun=0, hora de inicio] por referente. */
const SEED_PATTERN: Readonly<Record<string, readonly (readonly [number, number])[]>> = {
  [DEMO_REFERENT_EMAIL]: [[0, 10], [1, 15], [3, 9], [4, 14]],
  'lucia.fernandez@ibm.com': [[0, 9], [1, 11], [2, 16], [3, 10], [4, 9]],
  'martin.silva@ibm.com': [[1, 14], [2, 10], [4, 11]],
  'valeria.rojas@ibm.com': [[0, 15], [2, 9], [3, 15], [4, 16]],
};

export function toIsoDate(d: Date): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Fechas lun-vie de la semana de `today` (fin de semana → la semana siguiente). */
export function getWeekDates(today: Date = new Date()): readonly string[] {
  const dow = today.getDay();
  const offset = dow === 0 ? 1 : dow === 6 ? 2 : 1 - dow;
  return DAY_LABELS.map((_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset + i);
    return toIsoDate(d);
  });
}

export function buildSeedSlots(today: Date = new Date()): readonly IAvailabilitySlot[] {
  const week = getWeekDates(today);
  return Object.entries(SEED_PATTERN).flatMap(([referentId, items]) =>
    items.map(([day, hour]) => ({
      id: `seed-${referentId}-${week[day]}-${hour}`,
      referentId,
      date: week[day],
      startHour: hour,
      endHour: hour + 1,
    })));
}

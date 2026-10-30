export const AVAILABLE_NOW_LABEL = 'Disponible ya';

const pad = (value: number): string => String(value).padStart(2, '0');

function toLocalDay(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** 'YYYY-MM-DD' → 'DD/MM/YYYY' sin pasar por Date (evita el corrimiento por zona horaria). */
export function formatBenchDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

/** Compara por día calendario local; `now` se inyecta para poder testearlo. */
export function formatAvailability(availableFrom: string, now: Date = new Date()): string {
  return availableFrom.slice(0, 10) <= toLocalDay(now) ? AVAILABLE_NOW_LABEL : formatBenchDate(availableFrom);
}

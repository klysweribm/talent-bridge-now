/** Formato de fecha de calendario `YYYY-MM-DD`. */
export const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Fecha de calendario real: `2026-02-30` la desplaza `Date` a marzo y `2026-13-01` hace que `toISOString` lance; ambas se rechazan sin lanzar. */
export const isRealDate = (value: unknown): boolean => {
  if (typeof value !== 'string' || !ISO_DATE_PATTERN.test(value)) return false;
  const time = Date.parse(`${value}T00:00:00Z`);
  return !Number.isNaN(time) && new Date(time).toISOString().startsWith(value);
};

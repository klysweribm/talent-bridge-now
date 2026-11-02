const pad = (value: number): string => String(value).padStart(2, '0');

/** ISO timestamp → 'DD/MM/YYYY' (día calendario local); si no es fecha devuelve el valor tal cual. */
export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

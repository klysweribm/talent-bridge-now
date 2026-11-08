/** `YYYY-MM-DD` → `DD/MM/YYYY`. Se parte el texto a mano: `new Date()` lo leería como UTC y podría mostrar el día anterior. */
export function formatStartDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

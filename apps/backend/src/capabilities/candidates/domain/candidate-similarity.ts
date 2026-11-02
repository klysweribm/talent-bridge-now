/** Claves de búsqueda para detectar perfiles parecidos. Puro: sin dependencias de framework. */
export const PHONE_KEY_DIGITS = 8;

const COMBINING_MARKS = /\p{M}/gu;
const NON_LETTERS = /[^\p{L}]+/gu;
const NON_DIGITS = /\D/g;

/** Minúsculas, sin tildes, solo letras, palabras ordenadas. Vacío si no hay letras. */
export function normalizeName(name: string): string {
  const cleaned = name.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase().replace(NON_LETTERS, ' ');
  return cleaned.split(' ').filter((word) => word.length > 0).sort().join(' ');
}

/** Últimos `PHONE_KEY_DIGITS` dígitos; `undefined` si hay menos (sin clave). */
export function phoneKey(phone: string | undefined): string | undefined {
  const digits = (phone ?? '').replace(NON_DIGITS, '');
  return digits.length < PHONE_KEY_DIGITS ? undefined : digits.slice(-PHONE_KEY_DIGITS);
}

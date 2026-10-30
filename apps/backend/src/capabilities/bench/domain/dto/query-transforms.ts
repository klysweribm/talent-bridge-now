import type { TransformFnParams } from 'class-transformer';

/**
 * Acepta `a,b` o `a&a=b` (param repetido) y devuelve la lista recortada.
 * Las entradas vacías se conservan a propósito: la validación las rechaza.
 */
export function toTrimmedList({ value }: TransformFnParams): unknown {
  if (value === undefined || value === null) return undefined;
  const raw: readonly unknown[] = Array.isArray(value) ? value : [value];
  if (!raw.every((item): item is string => typeof item === 'string')) return value;
  return raw.flatMap((item) => item.split(',')).map((item) => item.trim());
}

export function toTrimmedString({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

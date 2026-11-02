import { CANDIDATE_LIST_MAX, CANDIDATE_TEXT_MAX } from './constants/candidate.constants';

export type TRecord = Record<string, unknown>;
export const isRecord = (value: unknown): value is TRecord => typeof value === 'object' && value !== null && !Array.isArray(value);
export const isAbsent = (value: unknown): boolean => value === undefined || value === null;

/** Cuenta lo descartado y expone lectores que devuelven `undefined` ante cualquier valor que no encaje. */
export class Reader {
  dropped = 0;

  reject(): undefined {
    this.dropped += 1;
    return undefined;
  }

  text(value: unknown, max = CANDIDATE_TEXT_MAX, pattern?: RegExp): string | undefined {
    if (isAbsent(value)) return undefined;
    const trimmed = typeof value === 'string' ? value.trim() : '';
    return trimmed.length > 0 && trimmed.length <= max && (pattern?.test(trimmed) ?? true) ? trimmed : this.reject();
  }

  number(value: unknown, min: number, max: number, integer = false): number | undefined {
    if (isAbsent(value)) return undefined;
    const ok = typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max && (!integer || Number.isInteger(value));
    return ok ? (value) : this.reject();
  }

  oneOf<T>(value: unknown, allowed: readonly T[]): T | undefined {
    if (isAbsent(value)) return undefined;
    return allowed.includes(value as T) ? (value as T) : this.reject();
  }

  list<T>(value: unknown, item: (raw: unknown) => T | undefined): readonly T[] | undefined {
    if (isAbsent(value)) return undefined;
    if (!Array.isArray(value)) return this.reject();
    const kept = value.slice(0, CANDIDATE_LIST_MAX).flatMap((raw: unknown) => {
      const parsed = item(raw);
      return parsed === undefined ? [] : [parsed];
    });
    return kept.length > 0 ? kept : undefined;
  }

  /** Objeto con al menos un campo válido; si no, se descarta entero. */
  object<T extends object>(value: unknown, build: (raw: TRecord) => T): T | undefined {
    if (!isRecord(value)) return this.reject();
    const built = compact(build(value));
    return Object.keys(built).length > 0 ? built : this.reject();
  }
}

export function compact<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
}


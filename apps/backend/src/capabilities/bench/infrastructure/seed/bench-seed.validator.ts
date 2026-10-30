import type { IBenchResource } from '@ibm-talent-bridge/shared-types';
import {
  isBenchCode, isBenchStatus, isIsoDate, isLanguageLevel, isLocation, isNonEmptyArrayOf,
  isNonEmptyString, isRecord, isSeniority, isSkillLevel, type TRecord,
} from './bench-seed.guards';

export type TBenchSeedItem = Omit<IBenchResource, 'id'>;

const FIELD_GUARDS: Readonly<Record<keyof TBenchSeedItem, (value: unknown) => boolean>> = {
  benchCode: isBenchCode,
  displayName: isNonEmptyString,
  primaryRole: isNonEmptyString,
  practice: isNonEmptyString,
  seniority: isSeniority,
  skills: isNonEmptyArrayOf(isSkillLevel),
  languages: isNonEmptyArrayOf(isLanguageLevel),
  location: isLocation,
  benchSince: isIsoDate,
  availableFrom: isIsoDate,
  status: isBenchStatus,
};

const FIELDS = Object.keys(FIELD_GUARDS);

function describeItem(item: unknown, index: number): string {
  const code = isRecord(item) ? item.benchCode : undefined;
  return typeof code === 'string' && code !== '' ? code : `index ${index}`;
}

function firstFailingField(item: TRecord): string | undefined {
  const unexpected = Object.keys(item).find((key) => !FIELDS.includes(key));
  if (unexpected) return `${unexpected} (unexpected field)`;
  return FIELDS.find((field) => !FIELD_GUARDS[field as keyof TBenchSeedItem](item[field]));
}

function assertValid(item: unknown, index: number): asserts item is TBenchSeedItem {
  const label = describeItem(item, index);
  if (!isRecord(item)) throw new Error(`Invalid bench seed item ${label}: not an object`);
  const failing = firstFailingField(item);
  if (failing) throw new Error(`Invalid bench seed item ${label}: field ${failing}`);
  if (item.availableFrom as string < (item.benchSince as string)) {
    throw new Error(`Invalid bench seed item ${label}: field availableFrom precedes benchSince`);
  }
}

/** Valida el JSON del mock con type guards; lanza ante el primer ítem inválido o benchCode duplicado. */
export function validateBenchSeed(raw: unknown): readonly TBenchSeedItem[] {
  if (!Array.isArray(raw)) throw new Error('Invalid bench seed: expected an array');
  raw.forEach((item, index) => assertValid(item, index));
  const items = raw as readonly TBenchSeedItem[];
  const duplicated = items.find(
    (item, index) => items.findIndex((other) => other.benchCode === item.benchCode) !== index,
  );
  if (duplicated) throw new Error(`Invalid bench seed: duplicated benchCode ${duplicated.benchCode}`);
  return items;
}

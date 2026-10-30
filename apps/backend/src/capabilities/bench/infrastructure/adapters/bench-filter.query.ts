import type { FilterQuery } from 'mongoose';
import type { IBenchFilters } from '../../domain/interfaces/bench-filters.interface';
import type { BenchResourceModel } from './bench-resource.schema';

const REGEX_METACHARACTERS = /[.*+?^${}()|[\]\\]/g;

/** Escapa metacaracteres: el texto del usuario nunca se interpreta como regex. */
export function escapeRegex(text: string): string {
  return text.replace(REGEX_METACHARACTERS, '\\$&');
}

/** Coincidencia exacta (anclada) e insensible a mayúsculas sobre el nombre normalizado. */
const exactCaseInsensitive = (text: string): RegExp => new RegExp(`^${escapeRegex(text)}$`, 'i');

export function buildBenchQuery(filters: IBenchFilters): FilterQuery<BenchResourceModel> {
  return {
    status: { $in: filters.statuses },
    ...(filters.seniority.length > 0 && { seniority: { $in: filters.seniority } }),
    ...(filters.skills.length > 0 && {
      'skills.name': { $all: filters.skills.map(exactCaseInsensitive) },
    }),
    ...(filters.country && { 'location.country': filters.country }),
    ...(filters.availableBy && { availableFrom: { $lte: filters.availableBy } }),
  };
}

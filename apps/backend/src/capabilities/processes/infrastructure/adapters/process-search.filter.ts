import type { FilterQuery } from 'mongoose';
import type { ProcessDocument } from './process.schema';

/** Antepone `\` a todo metacarácter de regex: la entrada del usuario nunca se interpreta como patrón. */
export const escapeRegex = (raw: string): string => raw.replace(/[.*+?^${}()|[\]\\/-]/g, '\\$&');

const SEARCH_FIELDS = ['title', 'clientName', 'opportunityRole'] as const;

/** Filtro de búsqueda por título, cliente o rol de la oportunidad (sin distinguir mayúsculas). Sin `q` = sin filtro. */
export function buildProcessSearchFilter(q: string | undefined): FilterQuery<ProcessDocument> {
  if (q === undefined || q === '') return {};
  const $regex = escapeRegex(q);
  return { $or: SEARCH_FIELDS.map((field) => ({ [field]: { $regex, $options: 'i' } })) };
}

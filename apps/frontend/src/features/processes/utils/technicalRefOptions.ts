import type { IProcessTechnicalRef, IUserOption } from '@ibm-talent-bridge/shared-types';

export interface ITechnicalRefOption {
  readonly id:       string;
  readonly fullName: string;
  readonly band:     number | null;
  readonly inactive: boolean;
}

/** Asignados ∪ disponibles (sin duplicar): un asignado inactivo o ausente del listado sigue visible para poder quitarlo. */
export function buildTechnicalRefOptions(assigned: readonly IProcessTechnicalRef[], available: readonly IUserOption[]): readonly ITechnicalRefOption[] {
  const fromAssigned = assigned.map(ref => ({ id: ref.id, fullName: ref.fullName, band: ref.band, inactive: ref.status === 'inactive' }));
  const known = new Set(fromAssigned.map(option => option.id));
  const extra = available.filter(user => !known.has(user.id)).map(user => ({ id: user.id, fullName: user.fullName, band: user.band ?? null, inactive: false }));
  return [...fromAssigned, ...extra];
}

/** Compara como conjunto: el orden de marcado no cuenta como cambio. */
export function sameIdSet(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every(id => b.includes(id));
}

/** Alterna un id respetando el tope: marcar con el tope alcanzado no hace nada. */
export function toggleTechnicalRef(selected: readonly string[], id: string, max: number): readonly string[] {
  if (selected.includes(id)) return selected.filter(current => current !== id);
  return selected.length >= max ? selected : [...selected, id];
}

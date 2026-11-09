import { vi } from 'vitest';
import { screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import type { ICandidate, IProcessCandidateSummary } from '@ibm-talent-bridge/shared-types';
import * as infra from './infrastructure/processCreate.infra';
import { makeCandidate, makePage } from './test-utils';

/** Candidato inventado que devuelve el alta simulada (candidates.infra). */
export const CREATED_CANDIDATE: ICandidate = {
  id: 'new1', status: 'tentative', fullName: 'Persona Inventada', email: 'persona@example.com', primaryRole: 'Backend Developer',
  createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', updateCount: 0,
};
export const CREATED_ROW_LABEL = 'Persona Inventada · Backend Developer';
export const CREATED_SUMMARY: IProcessCandidateSummary = { id: 'new1', fullName: 'Persona Inventada', primaryRole: 'Backend Developer' };

export function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>(res => { resolve = res; });
  return { promise, resolve };
}

/** La lista de disponibles incluye al candidato creado solo a partir de `markCreated()` (como haría el backend). */
export function mockAvailableList(initialCount = 2): { markCreated: () => void } {
  let created = false;
  const initial = Array.from({ length: initialCount }, (_, i) => makeCandidate(i + 1));
  vi.mocked(infra.fetchAvailableCandidates).mockImplementation(() => Promise.resolve(makePage(created ? [...initial, CREATED_SUMMARY] : initial)));
  return { markCreated: () => { created = true; } };
}

export async function openPanel(user: UserEvent): Promise<void> {
  await user.click(await screen.findByRole('button', { name: '+ Agregar candidato' }));
  await screen.findByRole('dialog', { name: 'Agregar candidato' });
}

export async function startManual(user: UserEvent): Promise<void> {
  await user.click(await screen.findByRole('button', { name: /escritura manual/i }));
}

export async function fillCandidate(user: UserEvent): Promise<void> {
  await user.type(screen.getByLabelText(/nombre completo/i), 'Persona Inventada');
  await user.type(screen.getByLabelText(/correo/i), 'persona@example.com');
}

export async function saveCandidate(user: UserEvent): Promise<void> {
  await user.click(screen.getByRole('button', { name: /crear candidato/i }));
}

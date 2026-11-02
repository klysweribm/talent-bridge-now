import { useState } from 'react';
import type { ICandidate, ICreateCandidateRequest } from '@ibm-talent-bridge/shared-types';
import { DuplicateCandidateError } from '../infrastructure/candidates.errors';
import { useCreateCandidate } from './useCreateCandidate';
import { useUpdateCandidate } from './useUpdateCandidate';

export interface IUseCandidateSubmission {
  /** `update` si el perfil ya existe (coincidencia exacta o elegido tras un duplicado). */
  readonly mode: 'create' | 'update';
  readonly submit: (request: ICreateCandidateRequest) => void;
  readonly isPending: boolean;
  readonly isSuccess: boolean;
  readonly saved: ICandidate | undefined;
  /** Error de guardado; un duplicado no cuenta (se expone en `duplicate`). */
  readonly error: Error | null;
  readonly duplicate: ICandidate | undefined;
  /** El modo actualización se eligió tras un duplicado (no vino de `matches.exact`). */
  readonly fromDuplicate: boolean;
  /** Pasa a modo actualización contra `existing.id`. */
  readonly switchToUpdate: (existing: ICandidate) => void;
}

/** Elige POST o PUT según el modo; ambos resultados se exponen unificados. */
export function useCandidateSubmission(exactId: string | undefined): IUseCandidateSubmission {
  const [forcedId, setForcedId] = useState<string | undefined>();
  const create = useCreateCandidate();
  const update = useUpdateCandidate();
  const targetId = forcedId ?? exactId;
  const active = targetId ? update : create;

  const duplicate = create.error instanceof DuplicateCandidateError && !targetId ? create.error.existing : undefined;

  return {
    mode: targetId ? 'update' : 'create',
    submit: request => (targetId ? update.mutate({ id: targetId, request }) : create.mutate(request)),
    isPending: active.isPending,
    isSuccess: active.isSuccess,
    saved: active.data,
    error: duplicate ? null : active.error,
    fromDuplicate: forcedId !== undefined,
    duplicate,
    switchToUpdate: existing => { create.reset(); setForcedId(existing.id); },
  };
}

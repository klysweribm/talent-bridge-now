import { useState } from 'react';
import type { ICandidate } from '@ibm-talent-bridge/shared-types';
import { CANDIDATES_PATH } from '@/router/paths';
import { CANDIDATE_EXIT_LINKS } from '../../../config/candidateList.constants';
import { CandidateCreated } from '../../molecules/CandidateCreated';
import { CandidateCreateForm } from '../CandidateCreateForm/CandidateCreateForm';

interface ISaved { readonly candidate: ICandidate; readonly mode: 'created' | 'updated' }

/** Página de alta: el formulario reutilizable y, al guardar, la confirmación con «Cargar otro» y el enlace de salida. */
export function NewCandidateFlow(): JSX.Element {
  const [saved, setSaved] = useState<ISaved | undefined>();

  if (saved) {
    return <CandidateCreated candidate={saved.candidate} mode={saved.mode} onRestart={() => setSaved(undefined)} exitTo={CANDIDATES_PATH} exitLabel={CANDIDATE_EXIT_LINKS.list.label} />;
  }
  return <CandidateCreateForm onSuccess={(candidate, mode) => setSaved({ candidate, mode })} />;
}

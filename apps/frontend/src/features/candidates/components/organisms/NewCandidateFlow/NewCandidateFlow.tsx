import { useState } from 'react';
import type { ICvExtractionResult } from '@ibm-talent-bridge/shared-types';
import { CandidateReviewForm } from '../CandidateReviewForm';
import { CvExtractionPanel } from '../CvExtractionPanel';

type TStep = { readonly kind: 'upload' } | { readonly kind: 'review'; readonly result?: ICvExtractionResult };

/** Paso 1: subir el CV (o escribir a mano). Paso 2: revisar el borrador y confirmar. */
export function NewCandidateFlow(): JSX.Element {
  const [step, setStep] = useState<TStep>({ kind: 'upload' });
  const restart = (): void => setStep({ kind: 'upload' });

  if (step.kind === 'upload') {
    return (
      <CvExtractionPanel
        onExtracted={result => setStep({ kind: 'review', result })}
        onManual={() => setStep({ kind: 'review' })}
      />
    );
  }
  return <CandidateReviewForm result={step.result} onRestart={restart} />;
}

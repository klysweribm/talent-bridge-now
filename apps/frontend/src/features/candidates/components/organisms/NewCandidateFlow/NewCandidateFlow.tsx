import { useState } from 'react';
import type { ICvExtractionResult } from '@ibm-talent-bridge/shared-types';
import { CandidateReviewForm } from '../CandidateReviewForm';
import { CvExtractionPanel } from '../CvExtractionPanel';

/** El resultado y el archivo viajan a la revisión para mostrar la tarjeta del CV y sus palabras clave. */
type TStep = { readonly kind: 'upload' } | { readonly kind: 'review'; readonly result?: ICvExtractionResult; readonly file?: File };

/** Paso 1: subir el CV (o escribir a mano). Paso 2: revisar el borrador y confirmar. */
export function NewCandidateFlow(): JSX.Element {
  const [step, setStep] = useState<TStep>({ kind: 'upload' });
  const restart = (): void => setStep({ kind: 'upload' });

  if (step.kind === 'upload') {
    return (
      <CvExtractionPanel
        onExtracted={(result, file) => setStep({ kind: 'review', result, file })}
        onManual={() => setStep({ kind: 'review' })}
      />
    );
  }
  return <CandidateReviewForm result={step.result} file={step.file} onRestart={restart} />;
}

import { useState } from 'react';
import type { ICandidate, ICvExtractionResult } from '@ibm-talent-bridge/shared-types';
import type { ICandidateCreateFormState } from '../../../hooks/useReportFormState';
import { CandidateReviewForm } from '../CandidateReviewForm';
import { CvExtractionPanel } from '../CvExtractionPanel';

export type { ICandidateCreateFormState };

export interface CandidateCreateFormProps {
  /** Siempre se llama al guardar (crear o actualizar); este organismo nunca pinta la confirmación. */
  readonly onSuccess: (candidate: ICandidate, mode: 'created' | 'updated') => void;
  readonly onCancel?: () => void;
  /** Una sola columna en las tarjetas de método, por prop y no por breakpoint. */
  readonly stacked?: boolean;
  readonly onStateChange?: (state: ICandidateCreateFormState) => void;
}

/** El resultado y el archivo viajan a la revisión para mostrar la tarjeta del CV y sus palabras clave. */
type TStep = { readonly kind: 'upload' } | { readonly kind: 'review'; readonly result?: ICvExtractionResult; readonly file?: File };

/** Paso 1: subir el CV (o escribir a mano). Paso 2: revisar el borrador y confirmar. */
export function CandidateCreateForm({ onSuccess, onCancel, stacked, onStateChange }: CandidateCreateFormProps): JSX.Element {
  const [step, setStep] = useState<TStep>({ kind: 'upload' });

  if (step.kind === 'upload') {
    return (
      <CvExtractionPanel
        onExtracted={(result, file) => setStep({ kind: 'review', result, file })}
        onManual={() => setStep({ kind: 'review' })}
        onCancel={onCancel}
        stacked={stacked}
        onStateChange={onStateChange}
      />
    );
  }
  return (
    <CandidateReviewForm
      result={step.result}
      file={step.file}
      onRestart={() => setStep({ kind: 'upload' })}
      onSaved={onSuccess}
      onCancel={onCancel}
      onStateChange={onStateChange}
    />
  );
}

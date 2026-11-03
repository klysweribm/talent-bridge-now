import { ProgressBar } from '@shared/components/atoms/ProgressBar/ProgressBar';
import { CV_ANALYSIS_COPY } from '../../../config/candidates.copy';

/** Se monta solo mientras la extracción está en curso. El backend es síncrono: la barra es indeterminada, sin porcentaje. */
export function CvAnalysisCard(): JSX.Element {
  return (
    <div className="flex flex-col gap-sm rounded border border-outline-variant bg-surface-card p-base">
      <p className="text-body-md-medium text-text-primary">{CV_ANALYSIS_COPY.title}</p>
      <ProgressBar label={CV_ANALYSIS_COPY.progressLabel} />
      <p role="status" className="text-body-md text-text-secondary">{CV_ANALYSIS_COPY.waiting}</p>
    </div>
  );
}

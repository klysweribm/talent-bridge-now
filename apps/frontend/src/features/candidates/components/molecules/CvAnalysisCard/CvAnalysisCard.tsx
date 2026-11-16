import { ProgressBar } from '@shared/components/atoms/ProgressBar/ProgressBar';
import { CV_ANALYSIS_COPY } from '../../../config/candidates.copy';

/** Se monta solo mientras la extracción está en curso. El backend es síncrono: la barra es indeterminada, sin porcentaje. */
export function CvAnalysisCard(): JSX.Element {
  return (
    <div className="flex flex-col gap-sm bg-white p-base">
      <p className="font-semibold text-body text-carbon-gray-100">{CV_ANALYSIS_COPY.title}</p>
      <ProgressBar label={CV_ANALYSIS_COPY.progressLabel} />
      <p role="status" className="text-body text-carbon-gray-70">{CV_ANALYSIS_COPY.waiting}</p>
    </div>
  );
}

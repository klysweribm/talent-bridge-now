import type { TCvExtractor } from '@ibm-talent-bridge/shared-types';
import { CLASSIC_COMPLETED_LABEL, EXTRACTOR_LABELS } from '../../../config/candidates.constants';

export interface ExtractorBadgeProps {
  readonly extractor: TCvExtractor;
  /** Solo aplica a `classic`: ICA completó lo que las reglas no detectaron. */
  readonly completedWith?: 'ica-text';
}

export function ExtractorBadge({ extractor, completedWith }: ExtractorBadgeProps): JSX.Element {
  const label = extractor === 'classic' && completedWith ? CLASSIC_COMPLETED_LABEL : EXTRACTOR_LABELS[extractor];
  return (
    <span className="inline-flex items-center h-6 px-sm rounded bg-status-info-bg text-label-md font-medium text-status-info-text">
      Extraído con {label}
    </span>
  );
}

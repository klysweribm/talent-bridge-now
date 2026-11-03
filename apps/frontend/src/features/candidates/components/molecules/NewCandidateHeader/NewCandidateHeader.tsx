import type { ICvExtractionResult } from '@ibm-talent-bridge/shared-types';
import { NEW_CANDIDATE_TITLE } from '../../../config/candidates.copy';
import { ExtractorBadge } from '../../atoms/ExtractorBadge';

export interface NewCandidateHeaderProps {
  /** Con resultado, la insignia indica con qué extractor se leyó el CV. */
  readonly result?: ICvExtractionResult;
}

export function NewCandidateHeader({ result }: NewCandidateHeaderProps): JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-between gap-sm">
      <h2 className="text-headline-sm text-text-primary">{NEW_CANDIDATE_TITLE}</h2>
      {result && <ExtractorBadge extractor={result.extractor} completedWith={result.completedWith} />}
    </div>
  );
}

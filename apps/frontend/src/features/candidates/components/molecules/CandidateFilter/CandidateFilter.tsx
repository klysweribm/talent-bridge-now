import type { TCandidateAssignment } from '@ibm-talent-bridge/shared-types';
import { CANDIDATE_FILTERS, CANDIDATE_LIST_COPY } from '../../../config/candidateList.constants';

export interface CandidateFilterProps {
  readonly value:    TCandidateAssignment | undefined;
  readonly onChange: (value: TCandidateAssignment | undefined) => void;
}

export function CandidateFilter({ value, onChange }: CandidateFilterProps): JSX.Element {
  return (
    <div role="group" aria-label={CANDIDATE_LIST_COPY.filterLabel} className="inline-flex gap-xs">
      {CANDIDATE_FILTERS.map(option => {
        const active = option.value === value;
        return (
          <button
            key={option.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`h-9 px-base rounded border text-body-md-medium transition-colors duration-150 ${
              active ? 'bg-primary-interactive border-primary-interactive text-white' : 'border-outline-variant text-text-secondary hover:bg-surface'}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

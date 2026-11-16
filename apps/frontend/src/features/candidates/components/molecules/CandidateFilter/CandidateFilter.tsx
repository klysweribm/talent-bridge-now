import type { TCandidateAssignment } from '@ibm-talent-bridge/shared-types';
import { CANDIDATE_FILTERS, CANDIDATE_LIST_COPY } from '../../../config/candidateList.constants';

export interface CandidateFilterProps {
  readonly value:    TCandidateAssignment | undefined;
  readonly onChange: (value: TCandidateAssignment | undefined) => void;
}

export function CandidateFilter({ value, onChange }: CandidateFilterProps): JSX.Element {
  return (
    <div role="group" aria-label={CANDIDATE_LIST_COPY.filterLabel} className="inline-flex self-start border border-carbon-gray-100">
      {CANDIDATE_FILTERS.map(option => {
        const active = option.value === value;
        return (
          <button
            key={option.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`h-[38px] px-base text-body focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-carbon-blue-60 ${
              active ? 'bg-carbon-gray-100 text-white' : 'bg-white text-carbon-gray-100 hover:bg-carbon-gray-hover'}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

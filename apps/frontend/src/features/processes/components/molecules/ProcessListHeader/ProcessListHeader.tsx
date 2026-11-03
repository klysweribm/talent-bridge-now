import { SearchBar } from '@shared/components/molecules/SearchBar/SearchBar';
import { PROCESS_LIST_COPY, PROCESS_SEARCH_MAX_LENGTH } from '../../../config/processList.constants';

export interface ProcessListHeaderProps {
  readonly headingId: string;
  readonly total?:    number;
  readonly query:     string;
  readonly onQueryChange: (value: string) => void;
  readonly onClear:   () => void;
}

export function ProcessListHeader({ headingId, total, query, onQueryChange, onClear }: ProcessListHeaderProps): JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md">
      <div className="flex items-center gap-sm">
        <h2 id={headingId} className="text-headline-sm text-text-primary">{PROCESS_LIST_COPY.recentTitle}</h2>
        {total !== undefined && (
          <span
            aria-label={`${PROCESS_LIST_COPY.countLabel}: ${total}`}
            className="inline-flex items-center h-6 px-sm rounded-full bg-surface-high text-label-md text-text-primary"
          >
            {total}
          </span>
        )}
      </div>
      <SearchBar
        value={query}
        maxLength={PROCESS_SEARCH_MAX_LENGTH}
        placeholder={PROCESS_LIST_COPY.filterPlaceholder}
        onChange={event => onQueryChange(event.target.value)}
        onClear={onClear}
        className="w-full sm:w-72"
      />
    </div>
  );
}

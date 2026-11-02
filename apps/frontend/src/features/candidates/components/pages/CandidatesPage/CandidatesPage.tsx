import { CANDIDATE_LIST_COPY } from '../../../config/candidateList.constants';
import { AddCandidateLink } from '../../molecules/AddCandidateLink/AddCandidateLink';
import { CandidateListTable } from '../../organisms/CandidateListTable/CandidateListTable';

export function CandidatesPage(): JSX.Element {
  return (
    <div className="px-xl py-lg flex flex-col gap-lg w-full max-w-7xl mx-auto">
      <header className="flex items-center justify-between gap-md">
        <h1 className="text-headline-md text-text-primary">{CANDIDATE_LIST_COPY.title}</h1>
        <AddCandidateLink />
      </header>
      <CandidateListTable />
    </div>
  );
}

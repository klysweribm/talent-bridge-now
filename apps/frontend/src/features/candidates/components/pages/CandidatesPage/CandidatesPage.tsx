import { CANDIDATE_LIST_COPY } from '../../../config/candidateList.constants';
import { AddCandidateLink } from '../../molecules/AddCandidateLink/AddCandidateLink';
import { CandidateListTable } from '../../organisms/CandidateListTable/CandidateListTable';

export function CandidatesPage(): JSX.Element {
  return (
    <div className="flex flex-col gap-lg w-full max-w-content-max mx-auto px-xl pt-lg pb-3xl">
      <header className="flex items-center justify-between gap-md">
        <h1 className="text-h1 text-carbon-gray-100">{CANDIDATE_LIST_COPY.title}</h1>
        <AddCandidateLink />
      </header>
      <CandidateListTable />
    </div>
  );
}

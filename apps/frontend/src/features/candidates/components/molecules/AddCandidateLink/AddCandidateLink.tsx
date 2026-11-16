import { Link } from 'react-router-dom';
import { CANDIDATES_NEW_PATH } from '@/router/paths';
import { CANDIDATE_LIST_COPY } from '../../../config/candidateList.constants';

/** Única acción primaria de la pantalla de candidatos. */
export function AddCandidateLink(): JSX.Element {
  return (
    <Link
      to={CANDIDATES_NEW_PATH}
      className="inline-flex items-center justify-start h-10 pl-base pr-2xl rounded-none bg-carbon-blue-60 text-white text-body hover:bg-carbon-blue-60-hover active:bg-carbon-blue-80 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-carbon-blue-60 transition-colors duration-150"
    >
      {CANDIDATE_LIST_COPY.addCandidate}
    </Link>
  );
}

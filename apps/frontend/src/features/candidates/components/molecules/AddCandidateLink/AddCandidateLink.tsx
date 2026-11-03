import { Link } from 'react-router-dom';
import { CANDIDATES_NEW_PATH } from '@/router/paths';
import { CANDIDATE_LIST_COPY } from '../../../config/candidateList.constants';

/** Única acción primaria de la pantalla de candidatos. */
export function AddCandidateLink(): JSX.Element {
  return (
    <Link
      to={CANDIDATES_NEW_PATH}
      className="inline-flex items-center justify-center h-10 px-base rounded bg-primary-interactive text-white text-body-md-medium hover:bg-primary-container transition-colors duration-150"
    >
      {CANDIDATE_LIST_COPY.addCandidate}
    </Link>
  );
}

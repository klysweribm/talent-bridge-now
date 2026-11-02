import { Link } from 'react-router-dom';
import { NEW_PROCESS_PATH } from '@/router/paths';
import { PROCESS_LIST_COPY } from '../../../config/processList.constants';

/** Único botón «+ Nuevo proceso»: encabezado y estado vacío lo reutilizan. */
export function NewProcessLink(): JSX.Element {
  return (
    <Link
      to={NEW_PROCESS_PATH}
      className="inline-flex items-center justify-center h-10 px-base rounded bg-primary-interactive text-white text-body-md-medium hover:bg-primary-container transition-colors duration-150"
    >
      {PROCESS_LIST_COPY.newProcess}
    </Link>
  );
}

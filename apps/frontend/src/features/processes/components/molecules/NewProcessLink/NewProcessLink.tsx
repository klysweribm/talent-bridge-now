import { Link } from 'react-router-dom';
import { NEW_PROCESS_PATH } from '@/router/paths';
import { SIZE_CLASSES, VARIANT_CLASSES } from '@shared/components/atoms/Button/button.constants';
import { PROCESS_LIST_COPY } from '../../../config/processList.constants';

/** Único botón «+ Nueva oportunidad»: encabezado y estado vacío lo reutilizan. */
export function NewProcessLink(): JSX.Element {
  return (
    <Link
      to={NEW_PROCESS_PATH}
      className={`inline-flex items-center justify-start rounded-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-carbon-blue-60 ${VARIANT_CLASSES.primary} ${SIZE_CLASSES.lg}`}
    >
      {PROCESS_LIST_COPY.newProcess}
    </Link>
  );
}

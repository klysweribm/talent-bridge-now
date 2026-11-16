import { PROCESS_LIST_COPY } from '../../../config/processList.constants';
import { NewProcessLink } from '../../molecules/NewProcessLink/NewProcessLink';
import { ProcessListTable } from '../../organisms/ProcessListTable/ProcessListTable';

export function ProcessesPage(): JSX.Element {
  return (
    <div className="px-xl pt-lg pb-3xl flex flex-col gap-lg w-full max-w-content-max mx-auto">
      <header className="flex items-center justify-between gap-md">
        <h1 className="text-h1 text-carbon-gray-100">{PROCESS_LIST_COPY.title}</h1>
        <NewProcessLink />
      </header>
      <ProcessListTable />
    </div>
  );
}

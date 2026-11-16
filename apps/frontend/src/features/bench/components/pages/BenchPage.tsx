import { useSelectedResource } from '../../hooks/useSelectedResource';
import { BenchCounter } from '../organisms/BenchCounter';
import { BenchFiltersPanel } from '../organisms/BenchFiltersPanel';
import { BenchResourceDrawer } from '../organisms/BenchResourceDrawer';
import { BenchTable } from '../organisms/BenchTable';

export function BenchPage(): JSX.Element {
  const { code, select, close } = useSelectedResource();

  return (
    <div className="flex flex-col gap-lg w-full max-w-content-wide mx-auto px-xl pt-lg pb-3xl">
      <header className="flex flex-col gap-xs">
        <h1 className="text-h1 text-carbon-gray-100">Banca</h1>
        <BenchCounter />
      </header>
      <BenchFiltersPanel />
      <BenchTable onSelect={select} selectedCode={code} />
      {code && <BenchResourceDrawer code={code} onClose={close} />}
    </div>
  );
}

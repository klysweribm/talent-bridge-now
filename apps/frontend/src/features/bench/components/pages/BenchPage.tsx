import { useSelectedResource } from '../../hooks/useSelectedResource';
import { BenchCounter } from '../organisms/BenchCounter';
import { BenchFiltersPanel } from '../organisms/BenchFiltersPanel';
import { BenchResourceDrawer } from '../organisms/BenchResourceDrawer';
import { BenchTable } from '../organisms/BenchTable';

export function BenchPage(): JSX.Element {
  const { code, select, close } = useSelectedResource();

  return (
    <div className="px-xl py-lg flex flex-col gap-lg w-full max-w-7xl mx-auto">
      <header className="flex flex-col gap-xs">
        <h1 className="text-headline-md text-text-primary">Banca</h1>
        <BenchCounter />
      </header>
      <BenchFiltersPanel />
      <BenchTable onSelect={select} />
      {code && <BenchResourceDrawer code={code} onClose={close} />}
    </div>
  );
}

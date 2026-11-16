import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { makePage, makeResource } from '@features/bench/test-utils';
import { fetchBench } from '@features/bench/infrastructure/bench.infra';
import { SearchPanel } from './SearchPanel';

vi.mock('@features/bench/infrastructure/bench.infra', () => ({ fetchBench: vi.fn() }));

function setup(): () => void {
  vi.mocked(fetchBench).mockResolvedValue(makePage([makeResource()]));
  const onClose = vi.fn();
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter><SearchPanel onClose={onClose} /></MemoryRouter>
    </QueryClientProvider>,
  );
  return onClose;
}

describe('SearchPanel', () => {
  it('should show the empty hint before typing', () => {
    setup();
    expect(screen.getByText('Escribe un nombre, rol, skill, cliente o correo.')).toBeInTheDocument();
  });

  it('should group bench results for the typed text', async () => {
    setup();
    await userEvent.type(screen.getByRole('searchbox', { name: 'Texto a buscar' }), 'lucía');
    expect(await screen.findByRole('heading', { name: 'Recursos en banca · 1' })).toBeInTheDocument();
  });

  it('should explain when nothing matches', async () => {
    setup();
    await userEvent.type(screen.getByRole('searchbox'), 'zzz');
    expect(await screen.findByText('Sin resultados para "zzz".')).toBeInTheDocument();
  });

  it('should close with Escape', async () => {
    const onClose = setup();
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

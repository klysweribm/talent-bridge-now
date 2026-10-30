import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as infra from '../../../infrastructure/bench.infra';
import { makePage, makeResource, renderAt } from '../../../test-utils';
import { BenchTable } from './BenchTable';

vi.mock('../../../infrastructure/bench.infra');

const fetchBench = vi.mocked(infra.fetchBench);
const pending = new Promise<never>(() => undefined);

describe('BenchTable', () => {
  beforeEach(() => vi.resetAllMocks());

  it('should show the skeleton while loading', () => {
    fetchBench.mockReturnValue(pending);
    renderAt(<BenchTable onSelect={vi.fn()} />);
    expect(screen.getByRole('status', { name: 'Cargando banca' })).toBeInTheDocument();
  });

  it('should render a row per resource', async () => {
    fetchBench.mockResolvedValue(makePage([makeResource(), makeResource({ id: '2', benchCode: 'BN-0002', displayName: 'Marco Díaz' })]));
    renderAt(<BenchTable onSelect={vi.fn()} />);
    expect(await screen.findByText('Marco Díaz')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByRole('columnheader', { name: 'Skills principales' })).toBeInTheDocument();
  });

  it('should show the error state and call the infra again on "Reintentar"', async () => {
    fetchBench.mockRejectedValueOnce(new Error('boom')).mockResolvedValue(makePage([makeResource()]));
    renderAt(<BenchTable onSelect={vi.fn()} />);
    await userEvent.click(await screen.findByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Lucía Fernández')).toBeInTheDocument();
    expect(fetchBench).toHaveBeenCalledTimes(2);
  });

  it('should show the empty state and clear the URL filters', async () => {
    fetchBench.mockResolvedValue(makePage([]));
    renderAt(<BenchTable onSelect={vi.fn()} />, '/bench?country=Chile&skills=Java');
    await userEvent.click(await screen.findByRole('button', { name: 'Limpiar filtros' }));
    expect(screen.getByTestId('search')).toBeEmptyDOMElement();
    expect(fetchBench).toHaveBeenLastCalledWith({});
  });

  it('should page through results and keep the previous rows visible meanwhile', async () => {
    fetchBench.mockResolvedValueOnce(makePage([makeResource()], { total: 40, totalPages: 2 }));
    renderAt(<BenchTable onSelect={vi.fn()} />);
    expect(await screen.findByText('Lucía Fernández')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();

    fetchBench.mockReturnValueOnce(pending);
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));

    expect(screen.getByTestId('search')).toHaveTextContent('?page=2');
    expect(screen.getByText('Lucía Fernández')).toBeInTheDocument();
    expect(fetchBench).toHaveBeenLastCalledWith({ page: 2 });
  });

  it('should disable "Siguiente" on the last page', async () => {
    fetchBench.mockResolvedValue(makePage([makeResource()], { page: 2, total: 21, totalPages: 2 }));
    renderAt(<BenchTable onSelect={vi.fn()} />, '/bench?page=2');
    expect(await screen.findByRole('button', { name: 'Siguiente' })).toBeDisabled();
  });
});

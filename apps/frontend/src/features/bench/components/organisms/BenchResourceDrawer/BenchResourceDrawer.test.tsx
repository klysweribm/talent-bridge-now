import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as infra from '../../../infrastructure/bench.infra';
import { makeResource, renderAt } from '../../../test-utils';
import { BenchResourceDrawer } from './BenchResourceDrawer';

vi.mock('../../../infrastructure/bench.infra');

describe('BenchResourceDrawer', () => {
  beforeEach(() => vi.resetAllMocks());

  it('should expose an accessible modal dialog with the resource detail', async () => {
    vi.mocked(infra.fetchBenchResource).mockResolvedValue(makeResource());
    renderAt(<BenchResourceDrawer code="BN-0001" onClose={vi.fn()} />);
    const dialog = screen.getByRole('dialog', { name: 'BN-0001' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveFocus();
    expect(await screen.findByRole('dialog', { name: 'Lucía Fernández · BN-0001' })).toBeInTheDocument();
    expect(screen.getByText('Nivel 5 · 8 años')).toBeInTheDocument();
    expect(infra.fetchBenchResource).toHaveBeenCalledWith('BN-0001');
  });

  it('should close from the button and with Escape', async () => {
    vi.mocked(infra.fetchBenchResource).mockResolvedValue(makeResource());
    const onClose = vi.fn();
    renderAt(<BenchResourceDrawer code="BN-0001" onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar detalle' }));
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('should show an error when the resource cannot be loaded', async () => {
    vi.mocked(infra.fetchBenchResource).mockRejectedValue(new Error('404'));
    renderAt(<BenchResourceDrawer code="BN-9999" onClose={vi.fn()} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar el recurso.');
  });
});

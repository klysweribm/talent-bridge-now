import { screen, within } from '@testing-library/react';
import * as infra from '../../../infrastructure/processes.infra';
import { renderWithProviders } from '../../../test-utils';
import { ActiveProcessesList } from './ActiveProcessesList';

describe('ActiveProcessesList', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('should show at most 5 rows and a "Ver todos" link', async () => {
    renderWithProviders(<ActiveProcessesList />);
    const section = await screen.findByRole('region', { name: 'Procesos activos' });
    expect(within(section).getAllByRole('listitem')).toHaveLength(5);
    expect(within(section).getByRole('link', { name: 'Ver todos' })).toHaveAttribute('href', '/processes?status=active');
  });

  it('should hide "Ver todos" when everything fits', async () => {
    vi.spyOn(infra, 'fetchActiveProcesses').mockResolvedValue({ items: [], total: 0 });
    renderWithProviders(<ActiveProcessesList />);
    expect(await screen.findByText('Aún no hay procesos.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Ver todos' })).not.toBeInTheDocument();
  });

  it('should offer to create the first process when empty', async () => {
    vi.spyOn(infra, 'fetchActiveProcesses').mockResolvedValue({ items: [], total: 0 });
    renderWithProviders(<ActiveProcessesList />);
    expect(await screen.findByRole('link', { name: 'Crear el primero' })).toHaveAttribute('href', '/processes/new');
  });
});

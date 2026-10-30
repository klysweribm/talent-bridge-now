import { screen, within } from '@testing-library/react';
import * as infra from '../../../infrastructure/processes.infra';
import { renderWithProviders } from '../../../test-utils';
import { TodayInterviewsList } from './TodayInterviewsList';

describe('TodayInterviewsList', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('should render one row per interview', async () => {
    renderWithProviders(<TodayInterviewsList />);
    const section = await screen.findByRole('region', { name: 'Entrevistas de hoy' });
    expect(within(section).getAllByRole('listitem').length).toBeGreaterThan(0);
    expect(within(section).getByText('Sergio Vega')).toBeInTheDocument();
  });

  it('should show an empty state with an action', async () => {
    vi.spyOn(infra, 'fetchTodayInterviews').mockResolvedValue([]);
    renderWithProviders(<TodayInterviewsList />);
    expect(await screen.findByText('No hay entrevistas hoy.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver agenda' })).toBeInTheDocument();
  });
});

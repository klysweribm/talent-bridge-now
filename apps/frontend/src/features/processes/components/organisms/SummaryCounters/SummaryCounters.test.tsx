import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test-utils';
import { SummaryCounters } from './SummaryCounters';

describe('SummaryCounters', () => {
  it('should render the 3 actionable counters linking to filtered lists', async () => {
    renderWithProviders(<SummaryCounters />);
    expect(await screen.findByRole('link', { name: /Procesos activos: \d+/ })).toHaveAttribute('href', '/processes?status=active');
    expect(screen.getByRole('link', { name: /Entrevistas hoy: \d+/ })).toHaveAttribute('href', '/interviews?date=today');
    expect(screen.getByRole('link', { name: /Feedback pendiente: \d+/ })).toHaveAttribute('href', '/feedback?status=pending');
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });
});

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as infra from '../../../infrastructure/bench.infra';
import { renderAt } from '../../../test-utils';
import { BenchFiltersPanel } from './BenchFiltersPanel';

vi.mock('../../../infrastructure/bench.infra');

describe('BenchFiltersPanel', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(infra.fetchBenchSkills).mockResolvedValue(['Java', 'Spring Boot']);
  });

  it('should fill the skill options from the API', async () => {
    renderAt(<BenchFiltersPanel />);
    expect(await screen.findByRole('option', { name: 'Spring Boot' })).toBeInTheDocument();
  });

  it('should write the chosen filters into the URL', async () => {
    renderAt(<BenchFiltersPanel />);
    await screen.findByRole('option', { name: 'Java' });
    await userEvent.selectOptions(screen.getByLabelText('Skills'), 'Java');
    await userEvent.click(screen.getByRole('button', { name: 'Sr' }));
    await waitFor(() => expect(screen.getByTestId('search')).toHaveTextContent('?skills=Java&seniority=sr'));
  });

  it('should restore the controls from the URL', () => {
    renderAt(<BenchFiltersPanel />, '/bench?seniority=sr&country=Chile&availableBy=2026-11-05&skills=Java');
    expect(screen.getByRole('button', { name: 'Sr' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('País')).toHaveValue('Chile');
    expect(screen.getByLabelText('Disponible antes de')).toHaveValue('2026-11-05');
    expect(screen.getByRole('button', { name: 'Quitar Java' })).toBeInTheDocument();
  });
});

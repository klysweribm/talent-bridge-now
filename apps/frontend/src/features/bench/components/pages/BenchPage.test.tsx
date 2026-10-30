import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as infra from '../../infrastructure/bench.infra';
import { makePage, makeResource, renderAt } from '../../test-utils';
import { BenchPage } from './BenchPage';

vi.mock('../../infrastructure/bench.infra');

const fetchBench = vi.mocked(infra.fetchBench);
const search = (): string => screen.getByTestId('search').textContent ?? '';

describe('BenchPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    fetchBench.mockResolvedValue(makePage([makeResource()], { total: 12 }));
    vi.mocked(infra.fetchBenchSkills).mockResolvedValue(['Java', 'Spring Boot']);
    vi.mocked(infra.fetchBenchResource).mockResolvedValue(makeResource());
  });

  it('should list the bench with the total and no filters by default', async () => {
    renderAt(<BenchPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Banca' })).toBeInTheDocument();
    expect(await screen.findByText('12 recursos en banca')).toBeInTheDocument();
    expect(await screen.findByText('Lucía Fernández')).toBeInTheDocument();
    expect(fetchBench).toHaveBeenCalledWith({});
  });

  it('should reflect skills + seniority in the URL, call the infra with them and restore them on remount', async () => {
    const view = renderAt(<BenchPage />);
    await screen.findByRole('option', { name: 'Java' });
    await userEvent.selectOptions(screen.getByLabelText('Skills'), 'Java');
    await userEvent.selectOptions(screen.getByLabelText('Skills'), 'Spring Boot');
    await userEvent.click(screen.getByRole('button', { name: 'Sr' }));

    expect(search()).toBe('?skills=Java&skills=Spring+Boot&seniority=sr');
    await waitFor(() => expect(fetchBench).toHaveBeenLastCalledWith({ skills: ['Java', 'Spring Boot'], seniority: ['sr'] }));

    const url = `/bench${search()}`;
    view.unmount();
    renderAt(<BenchPage />, url);
    expect(screen.getByRole('button', { name: 'Sr' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Quitar Spring Boot' })).toBeInTheDocument();
  });

  it('should reset the page to 1 when a filter changes', async () => {
    renderAt(<BenchPage />, '/bench?page=3');
    await userEvent.click(await screen.findByRole('button', { name: 'Lead' }));
    expect(search()).toBe('?seniority=lead');
  });

  it('should filter by "Disponible antes de"', async () => {
    renderAt(<BenchPage />);
    await userEvent.type(await screen.findByLabelText('Disponible antes de'), '2026-11-05');
    await waitFor(() => expect(fetchBench).toHaveBeenLastCalledWith({ availableBy: '2026-11-05' }));
  });

  it('should ignore invalid URL values and not send them', async () => {
    renderAt(<BenchPage />, '/bench?seniority=guru&availableBy=no-es-fecha&page=-1&limit=500');
    await screen.findByText('Lucía Fernández');
    expect(fetchBench).toHaveBeenCalledWith({});
    expect(fetchBench).not.toHaveBeenCalledWith(expect.objectContaining({ limit: 500 }));
  });

  it('should open the detail drawer from a row, keep the filters and return focus on Escape', async () => {
    renderAt(<BenchPage />, '/bench?country=Chile');
    await userEvent.click(await screen.findByText('Backend Developer'));

    const dialog = await screen.findByRole('dialog', { name: /Lucía Fernández/ });
    expect(search()).toBe('?country=Chile&resource=BN-0001');
    expect(await within(dialog).findByText('Nivel 5 · 8 años')).toBeInTheDocument();
    expect(within(dialog).getByText('ES · Nativo')).toBeInTheDocument();
    expect(within(dialog).getByText('Córdoba, Argentina')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(search()).toBe('?country=Chile');
    expect(screen.getByRole('button', { name: /BN-0001/ })).toHaveFocus();
  });

  it('should close the drawer with the close button', async () => {
    renderAt(<BenchPage />, '/bench?resource=BN-0001');
    await userEvent.click(await screen.findByRole('button', { name: 'Cerrar detalle' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

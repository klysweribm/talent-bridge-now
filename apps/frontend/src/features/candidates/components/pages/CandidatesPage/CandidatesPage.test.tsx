import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as infra from '../../../infrastructure/candidateList.infra';
import { makeListItem, makeListPage, renderAt } from '../../../test-utils';
import { CandidatesPage } from './CandidatesPage';

vi.mock('../../../infrastructure/candidateList.infra');

const fetchList = vi.mocked(infra.fetchCandidateList);
const search = (): string => screen.getByTestId('search').textContent ?? '';

describe('CandidatesPage', () => {
  beforeEach(() => { vi.resetAllMocks(); fetchList.mockResolvedValue(makeListPage([makeListItem()])); });

  it('should show the loading state, then the rows', async () => {
    renderAt(<CandidatesPage />, '/candidates');
    expect(screen.getByRole('heading', { level: 1, name: 'Candidatos' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: /cargando candidatos/i })).toBeInTheDocument();
    expect(await screen.findByText('Persona Inventada')).toBeInTheDocument();
    expect(fetchList).toHaveBeenCalledWith({});
  });

  it('should show a single "+ Agregar candidato" link to /candidates/new', async () => {
    renderAt(<CandidatesPage />, '/candidates');
    expect(await screen.findByRole('link', { name: '+ Agregar candidato' })).toHaveAttribute('href', '/candidates/new');
  });

  it.each([
    [undefined, 'Aún no hay candidatos'],
    ['available', 'No hay candidatos disponibles'],
    ['assigned', 'Ningún candidato está en una oportunidad'],
  ])('should show the empty message for filter %s without duplicating the add link', async (assignment, message) => {
    fetchList.mockResolvedValue(makeListPage([], { totalPages: 0 }));
    renderAt(<CandidatesPage />, assignment ? `/candidates?assignment=${assignment}` : '/candidates');
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: '+ Agregar candidato' })).toHaveLength(1);
  });

  it('should show the error state and retry', async () => {
    fetchList.mockRejectedValueOnce(new Error('boom'));
    renderAt(<CandidatesPage />, '/candidates');
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Persona Inventada')).toBeInTheDocument();
  });

  it('should write the filter in the URL, reset to page 1 and query with it', async () => {
    renderAt(<CandidatesPage />, '/candidates?page=3');
    await screen.findByText('Persona Inventada');
    await userEvent.click(screen.getByRole('button', { name: 'Disponibles' }));
    expect(search()).toBe('?assignment=available');
    await waitFor(() => expect(fetchList).toHaveBeenLastCalledWith({ assignment: 'available' }));
    await userEvent.click(screen.getByRole('button', { name: 'Todos' }));
    expect(search()).toBe('');
  });

  it('should change page in the URL keeping the filter', async () => {
    fetchList.mockResolvedValue(makeListPage([makeListItem()], { totalPages: 3 }));
    renderAt(<CandidatesPage />, '/candidates?assignment=assigned');
    await userEvent.click(await screen.findByRole('button', { name: 'Siguiente' }));
    expect(search()).toBe('?page=2&assignment=assigned');
    await waitFor(() => expect(fetchList).toHaveBeenLastCalledWith({ page: 2, assignment: 'assigned' }));
  });

  it('should restore params from the URL and discard invalid ones', async () => {
    renderAt(<CandidatesPage />, '/candidates?page=-1&limit=999&assignment=zzz');
    await waitFor(() => expect(fetchList).toHaveBeenCalledWith({}));
  });

  it('should link an assigned candidate to its process', async () => {
    fetchList.mockResolvedValue(makeListPage([makeListItem({ processId: 'p7' })]));
    renderAt(<CandidatesPage />, '/candidates');
    expect(await screen.findByRole('link', { name: 'En una oportunidad' })).toHaveAttribute('href', '/processes/p7');
  });
});

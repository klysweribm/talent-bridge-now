import { screen } from '@testing-library/react';
import type { IProcessDetail } from '@ibm-talent-bridge/shared-types';
import { HttpError } from '@shared/infrastructure/httpError';
import * as infra from '../../../infrastructure/processList.infra';
import { renderAt } from '../../../test-utils';
import { ProcessDetailPage } from './ProcessDetailPage';

vi.mock('../../../infrastructure/processList.infra');

const fetchDetail = vi.mocked(infra.fetchProcessDetail);
const detail: IProcessDetail = {
  id: 'p1', title: 'Backend Java Sr', clientName: 'Banco Andino', ownerPmId: 'pm1', recruiterId: null,
  maxCandidates: 5, createdBy: 'u1', createdAt: '2026-03-05T12:00:00.000Z', updatedAt: '2026-03-05T12:00:00.000Z',
  candidateIds: ['c1', 'c2'],
  candidates: [{ id: 'c1', fullName: 'Lucía Fernández', primaryRole: 'Backend Developer' }, { id: 'c2', fullName: 'Juan Pérez' }],
};
const mount = (): void => { renderAt(<p>lista-stub</p>, '/processes/p1', { path: '/processes/:id', element: <ProcessDetailPage /> }); };

describe('ProcessDetailPage', () => {
  beforeEach(() => { vi.resetAllMocks(); fetchDetail.mockResolvedValue(detail); });

  it('should show title, client, "N de MAX candidatos" and the read-only candidates', async () => {
    mount();
    expect(screen.getByRole('status', { name: /cargando proceso/i })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 1, name: 'Backend Java Sr' })).toBeInTheDocument();
    expect(screen.getByText('Banco Andino')).toBeInTheDocument();
    expect(screen.getByText('2 de 5 candidatos')).toBeInTheDocument();
    expect(screen.getByText('Lucía Fernández')).toBeInTheDocument();
    expect(screen.getByText('Backend Developer')).toBeInTheDocument();
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(fetchDetail).toHaveBeenCalledWith('p1');
  });

  it('should offer a "Volver a procesos" link', async () => {
    mount();
    expect(await screen.findByRole('link', { name: 'Volver a procesos' })).toHaveAttribute('href', '/processes');
  });

  it('should show an in-layout not-found error with a way back on 404', async () => {
    fetchDetail.mockRejectedValue(new HttpError(404, 'nf'));
    mount();
    expect(await screen.findByRole('alert')).toHaveTextContent('Proceso no encontrado');
    expect(screen.getByRole('link', { name: 'Volver a procesos' })).toHaveAttribute('href', '/processes');
  });

  it('should show a retryable generic error on other failures', async () => {
    fetchDetail.mockRejectedValue(new HttpError(500, 'x'));
    mount();
    expect(await screen.findByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });
});

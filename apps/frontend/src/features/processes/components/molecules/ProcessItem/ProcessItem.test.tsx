import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { IProcessListItem } from '@ibm-talent-bridge/shared-types';
import { ProcessItem } from './ProcessItem';

const BASE: IProcessListItem = {
  id: 'p9', title: 'QA Lead', clientName: 'ACME', ownerPmId: 'pm1', recruiterId: null, opportunityRole: '', skills: [], roleDescription: '', band: null, technicalRefIds: [], status: 'interviewing',
  maxCandidates: 5, candidateCount: 3, createdBy: 'u1',
  createdAt: '2026-03-05T12:00:00.000Z', updatedAt: '2026-03-05T12:00:00.000Z',
};

describe('ProcessItem', () => {
  beforeEach(() => {
    render(<MemoryRouter><ul><ProcessItem process={BASE} /></ul></MemoryRouter>);
  });

  it('should show title, client and "N de MAX candidatos"', () => {
    expect(screen.getByText('QA Lead')).toBeInTheDocument();
    expect(screen.getByText('ACME · 3 de 5 candidatos')).toBeInTheDocument();
  });

  it('should show the status chip with its text', () => {
    expect(screen.getByText('Entrevista')).toBeInTheDocument();
  });

  it('should link to the detail with an accessible name', () => {
    expect(screen.getByRole('link', { name: 'Ver detalle de QA Lead' })).toHaveAttribute('href', '/processes/p9');
    expect(screen.getByText('Ver detalle')).toBeInTheDocument();
  });

  it('should not render stage or health chips', () => {
    expect(screen.queryByLabelText(/Etapa/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/En tiempo|En riesgo/)).not.toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProcessRow } from './ProcessRow';
import type { IProcessSummary } from '../../../types/processes.types';

const BASE: IProcessSummary = { id: '9', title: 'QA Lead', client: 'ACME', stage: 'Inicial', candidatesCount: 3, health: 'on_track' };

function setup(process: IProcessSummary): void {
  render(<MemoryRouter><ul><ProcessRow process={process} /></ul></MemoryRouter>);
}

describe('ProcessRow', () => {
  it('should show name, client, candidates, stage, health and detail link', () => {
    setup(BASE);
    expect(screen.getByText('QA Lead')).toBeInTheDocument();
    expect(screen.getByText(/ACME · 3 candidatos/)).toBeInTheDocument();
    expect(screen.getByLabelText('Etapa: Inicial')).toBeInTheDocument();
    expect(screen.getByLabelText('En tiempo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver detalle de QA Lead' })).toHaveAttribute('href', '/processes/9');
  });

  it('should show "En riesgo" when health is at_risk', () => {
    setup({ ...BASE, health: 'at_risk' });
    expect(screen.getByLabelText('En riesgo')).toBeInTheDocument();
  });
});

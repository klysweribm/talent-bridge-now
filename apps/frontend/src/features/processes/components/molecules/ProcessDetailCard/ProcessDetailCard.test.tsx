import { render, screen } from '@testing-library/react';
import type { IProcessDetail } from '@ibm-talent-bridge/shared-types';
import { ProcessDetailCard } from './ProcessDetailCard';

const FULL: IProcessDetail = {
  id: 'p1', title: 'Backend Java', clientName: 'Banco', ownerPmId: 'pm1', recruiterId: null, status: 'interviewing',
  opportunityRole: 'Desarrollador Sr', skills: ['Java', 'Spring'], roleDescription: 'Evaluar APIs.', band: 8,
  candidateIds: ['c1'], technicalRefIds: [], maxCandidates: 5, createdBy: 'pm1',
  createdAt: '2026-03-05T12:00:00.000Z', updatedAt: '2026-03-05T12:00:00.000Z',
  candidates: [{ id: 'c1', fullName: 'Ana' }], technicalRefs: [],
};
const LEGACY: IProcessDetail = { ...FULL, opportunityRole: '', skills: [], roleDescription: '', band: null };

describe('ProcessDetailCard', () => {
  it('should show header, client, band, stack chips and expectations', () => {
    render(<ProcessDetailCard process={FULL} />);
    expect(screen.getByText('IBM CONSULTING LATAM')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Backend Java' })).toBeInTheDocument();
    expect(screen.getByText('Banco')).toBeInTheDocument();
    expect(screen.getByText('Band 8')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Stack tecnológico requerido' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').map(item => item.textContent)).toEqual(['Java', 'Spring']);
    expect(screen.getByRole('heading', { name: 'Expectativas de evaluación técnica' })).toBeInTheDocument();
    expect(screen.getByText('Evaluar APIs.')).toBeInTheDocument();
    expect(screen.getByText('Desarrollador Sr')).toBeInTheDocument();
  });

  it('should show the status chip and the N de MAX counter', () => {
    render(<ProcessDetailCard process={FULL} />);
    expect(screen.getByText('Entrevista')).toBeInTheDocument();
    expect(screen.getByText('1 de 5 candidatos')).toBeInTheDocument();
  });

  it('should hide empty sections and never print null for a legacy process', () => {
    const { container } = render(<ProcessDetailCard process={LEGACY} />);
    expect(screen.queryByText('Stack tecnológico requerido')).not.toBeInTheDocument();
    expect(screen.queryByText('Expectativas de evaluación técnica')).not.toBeInTheDocument();
    expect(screen.queryByText('Banda profesional')).not.toBeInTheDocument();
    expect(container).not.toHaveTextContent(/null|undefined/);
    expect(screen.getByText('Banco')).toBeInTheDocument();
  });
});

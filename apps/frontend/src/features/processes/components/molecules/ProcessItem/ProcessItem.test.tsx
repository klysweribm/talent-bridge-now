import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { IProcessListItem } from '@ibm-talent-bridge/shared-types';
import { ProcessItem } from './ProcessItem';

const MARTIN = { id: 'u1', fullName: 'Martín Rodríguez' };
const SOFIA = { id: 'u2', fullName: 'Sofía Vega', avatarUrl: 'https://img.test/sofia.png' };

const BASE: IProcessListItem = {
  id: 'p9', title: 'QA Lead', clientName: 'ACME', ownerPmId: 'pm1', recruiterId: null, opportunityRole: 'QA Senior', skills: [], roleDescription: '', band: null, technicalRefIds: [], technicalRefs: [], status: 'interviewing',
  maxCandidates: 5, candidateCount: 3, createdBy: 'u1',
  createdAt: '2026-03-05T12:00:00.000Z', updatedAt: '2026-03-05T12:00:00.000Z',
};
const setup = (over: Partial<IProcessListItem> = {}): void => {
  render(<MemoryRouter><ul><ProcessItem process={{ ...BASE, ...over }} /></ul></MemoryRouter>);
};

describe('ProcessItem', () => {
  it('should show title, "Cliente · rol" and the status chip', () => {
    setup();
    expect(screen.getByText('QA Lead')).toBeInTheDocument();
    expect(screen.getByText('ACME · QA Senior')).toBeInTheDocument();
    expect(screen.getByText('Entrevista')).toBeInTheDocument();
  });

  it('should show only the client when the role is empty', () => {
    setup({ opportunityRole: '' });
    expect(screen.getByText('ACME')).toBeInTheDocument();
  });

  it('should show "Sin referentes" and no avatar group with 0 referents', () => {
    setup();
    expect(screen.getByText('Sin referentes')).toBeInTheDocument();
    expect(screen.queryByLabelText('Referentes')).not.toBeInTheDocument();
  });

  it('should show one referent with abbreviated name and initials avatar', () => {
    setup({ technicalRefs: [MARTIN] });
    expect(screen.getByText('Referentes:')).toBeInTheDocument();
    expect(screen.getByText('Martín R.')).toBeInTheDocument();
    expect(screen.getByLabelText('Referentes')).toBeInTheDocument();
    expect(screen.getByText('MR')).toBeInTheDocument();
  });

  it('should show two referents joined with "y", using the image when present', () => {
    setup({ technicalRefs: [MARTIN, SOFIA] });
    expect(screen.getByText('Martín R. y Sofía V.')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Sofía Vega' })).toHaveAttribute('src', 'https://img.test/sofia.png');
    expect(screen.getByText('MR')).toBeInTheDocument();
  });

  it.each([[1, '1 candidato'], [3, '3 candidatos'], [0, '0 candidatos']])('should show %i as "%s" without the max', (count, text) => {
    setup({ candidateCount: count });
    expect(screen.getByText(text)).toBeInTheDocument();
    expect(screen.queryByText(/ de 5/)).not.toBeInTheDocument();
  });

  it('should link to the detail with an accessible name', () => {
    setup();
    const link = screen.getByRole('link', { name: 'Ver oportunidad de QA Lead' });
    expect(link).toHaveAttribute('href', '/processes/p9');
    expect(link).toHaveTextContent('Ver oportunidad');
  });
});

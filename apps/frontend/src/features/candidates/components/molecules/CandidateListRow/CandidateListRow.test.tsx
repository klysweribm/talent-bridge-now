import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { makeListItem } from '../../../test-utils';
import { CandidateListRow } from './CandidateListRow';

const renderRow = (over = {}): void => {
  render(<MemoryRouter><table><tbody><CandidateListRow candidate={makeListItem(over)} /></tbody></table></MemoryRouter>);
};

describe('CandidateListRow', () => {
  it('should show name, role, email, Disponible and the formatted date', () => {
    renderRow();
    expect(screen.getByText('Persona Inventada')).toBeInTheDocument();
    expect(screen.getByText('Backend Developer')).toBeInTheDocument();
    expect(screen.getByText('persona@example.com')).toBeInTheDocument();
    expect(screen.getByText('Disponible')).toBeInTheDocument();
    expect(screen.getByText('05/03/2026')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('should show an em dash when the role is missing', () => {
    renderRow({ primaryRole: undefined });
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('should link "En una oportunidad" to the process detail when assigned', () => {
    renderRow({ processId: 'p9' });
    expect(screen.getByRole('link', { name: 'En una oportunidad' })).toHaveAttribute('href', '/processes/p9');
    expect(screen.queryByText('Disponible')).not.toBeInTheDocument();
  });
});

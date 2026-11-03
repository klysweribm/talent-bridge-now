import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CandidateCreated } from './CandidateCreated';
import { makeCandidate } from '../../../test-utils';

describe('CandidateCreated exit link', () => {
  it('should render the link it receives by props', () => {
    render(<MemoryRouter><CandidateCreated candidate={makeCandidate()} mode="created" onRestart={vi.fn()} exitTo="/candidates" exitLabel="Ver candidatos" /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Ver candidatos' })).toHaveAttribute('href', '/candidates');
  });
});

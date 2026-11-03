import { render, screen } from '@testing-library/react';
import { makeResult } from '../../../test-utils';
import { NewCandidateHeader } from './NewCandidateHeader';

describe('NewCandidateHeader', () => {
  it('should show the title without a badge before any extraction', () => {
    render(<NewCandidateHeader />);
    expect(screen.getByRole('heading', { name: 'Crear ficha de nuevo candidato' })).toBeInTheDocument();
    expect(screen.queryByText(/extraído con/i)).not.toBeInTheDocument();
  });

  it('should show the extractor badge once there is a result', () => {
    render(<NewCandidateHeader result={makeResult('ica-text')} />);
    expect(screen.getByText(/extraído con ica \(texto\)/i)).toBeInTheDocument();
  });
});

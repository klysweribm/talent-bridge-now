import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AttentionList } from './AttentionList';

describe('AttentionList', () => {
  it('should show an honest message and never claim everything is up to date', () => {
    render(<MemoryRouter><AttentionList /></MemoryRouter>);
    expect(screen.getByRole('region', { name: 'Requiere atención' })).toBeInTheDocument();
    expect(screen.getByText('Las alertas aparecerán cuando se activen entrevistas y feedback')).toBeInTheDocument();
    expect(screen.queryByText(/todo al d[ií]a/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
});

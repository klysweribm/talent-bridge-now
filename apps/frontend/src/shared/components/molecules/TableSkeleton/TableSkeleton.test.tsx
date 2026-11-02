import { render, screen } from '@testing-library/react';
import { TableSkeleton } from './TableSkeleton';

describe('TableSkeleton', () => {
  it('should announce the loading label and render the requested rows spanning all columns', () => {
    render(<table><TableSkeleton label="Cargando cosas" rows={4} columnCount={5} /></table>);
    expect(screen.getByRole('status', { name: 'Cargando cosas' })).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(4);
    expect(screen.getAllByRole('cell')[0]).toHaveAttribute('colspan', '5');
  });
});

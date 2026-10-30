import { render, screen } from '@testing-library/react';
import { BenchTableSkeleton } from './BenchTableSkeleton';

describe('BenchTableSkeleton', () => {
  it('should announce the loading state and render placeholder rows', () => {
    render(<table><BenchTableSkeleton /></table>);
    expect(screen.getByRole('status', { name: 'Cargando banca' })).toBeInTheDocument();
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
  });
});

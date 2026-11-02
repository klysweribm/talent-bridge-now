import { render, screen, within } from '@testing-library/react';
import { ProcessItemSkeleton } from './ProcessItemSkeleton';

describe('ProcessItemSkeleton', () => {
  it('should expose a labelled status with the requested number of rows', () => {
    render(<ProcessItemSkeleton label="Cargando procesos" rows={3} />);
    const status = screen.getByRole('status', { name: 'Cargando procesos' });
    expect(within(status).getAllByRole('listitem', { hidden: true })).toHaveLength(3);
  });
});

import { render, screen, within } from '@testing-library/react';
import { ProcessItemSkeleton } from './ProcessItemSkeleton';

describe('ProcessItemSkeleton', () => {
  it('should expose a labelled status with the requested number of rows', () => {
    render(<ProcessItemSkeleton label="Cargando procesos" rows={3} />);
    const status = screen.getByRole('status', { name: 'Cargando procesos' });
    expect(within(status).getAllByRole('listitem', { hidden: true })).toHaveLength(3);
  });

  it('should mimic the card: title and chip, subtitle, avatars and button placeholders', () => {
    render(<ProcessItemSkeleton label="Cargando procesos" rows={1} />);
    const row = within(screen.getByRole('status')).getByRole('listitem', { hidden: true });
    expect(row).toHaveAttribute('aria-hidden', 'true');
    expect(row.querySelectorAll('.animate-pulse').length).toBeGreaterThanOrEqual(7);
    expect(row.querySelectorAll('.rounded-full')).toHaveLength(2);
  });
});

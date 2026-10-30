import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BenchEmptyState } from './BenchEmptyState';

describe('BenchEmptyState', () => {
  it('should show the message and clear the filters on demand', async () => {
    const onClear = vi.fn();
    render(<BenchEmptyState onClear={onClear} />);
    expect(screen.getByText('No hay recursos que coincidan con los filtros.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(onClear).toHaveBeenCalled();
  });
});

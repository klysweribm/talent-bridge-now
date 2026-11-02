import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListEmptyState } from './ListEmptyState';

describe('ListEmptyState', () => {
  it('should show the message and trigger the action on demand', async () => {
    const onAction = vi.fn();
    render(<ListEmptyState message="Sin resultados" actionLabel="Limpiar" onAction={onAction} />);
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Limpiar' }));
    expect(onAction).toHaveBeenCalled();
  });

  it('should omit the action button when no action is given', () => {
    render(<ListEmptyState message="Sin resultados" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render custom children after the message', () => {
    render(<ListEmptyState message="Vacío"><a href="/x">Ir</a></ListEmptyState>);
    expect(screen.getByRole('link', { name: 'Ir' })).toBeInTheDocument();
  });
});

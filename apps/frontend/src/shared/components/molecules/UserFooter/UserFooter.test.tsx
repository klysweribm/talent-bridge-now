import { render, screen } from '@testing-library/react';
import { UserFooter } from './UserFooter';

describe('UserFooter', () => {
  it('should render name, role and the action slot', () => {
    render(
      <UserFooter name="Ana Pérez" roleLabel="Reclutador" collapsed={false}>
        <button type="button">Acción</button>
      </UserFooter>,
    );

    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('Reclutador')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Acción' })).toBeInTheDocument();
  });

  it('should hide name and role text when collapsed', () => {
    render(<UserFooter name="Ana Pérez" roleLabel="Reclutador" collapsed />);

    expect(screen.getByText('Reclutador').parentElement).toHaveClass('hidden');
  });
});

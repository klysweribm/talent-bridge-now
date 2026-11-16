import { render, screen } from '@testing-library/react';
import { UserFooter } from './UserFooter';

describe('UserFooter', () => {
  it('should render name, role and the action slot', () => {
    render(
      <UserFooter name="Ana Pérez" roleLabel="Reclutador">
        <button type="button">Acción</button>
      </UserFooter>,
    );

    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('Reclutador')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Acción' })).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmSection } from './ConfirmSection';

describe('ConfirmSection', () => {
  it('should show title, content and an Editar button', async () => {
    const onEdit = vi.fn();
    render(<ConfirmSection title="Datos" editLabel="Editar" onEdit={onEdit} disabled={false}><p>contenido</p></ConfirmSection>);
    expect(screen.getByRole('heading', { name: 'Datos' })).toBeInTheDocument();
    expect(screen.getByText('contenido')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /editar/i }));
    expect(onEdit).toHaveBeenCalled();
  });

  it('should disable Editar while disabled', () => {
    render(<ConfirmSection title="Datos" editLabel="Editar" onEdit={vi.fn()} disabled><p>x</p></ConfirmSection>);
    expect(screen.getByRole('button', { name: /editar/i })).toBeDisabled();
  });
});

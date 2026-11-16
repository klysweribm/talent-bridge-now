import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalDialog } from './ModalDialog';

function setup(variant?: 'danger'): { onCancel: () => void; onConfirm: () => void } {
  const onCancel = vi.fn();
  const onConfirm = vi.fn();
  render(
    <ModalDialog
      titleId="t" descId="d" title="¿Descartar?" eyebrow="Confirmación" cancelLabel="Cancelar"
      onCancel={onCancel} confirmLabel="Descartar" onConfirm={onConfirm} confirmVariant={variant}
    >
      Se perderán los cambios.
    </ModalDialog>,
  );
  return { onCancel, onConfirm };
}

describe('ModalDialog', () => {
  it('should expose an accessible alertdialog with title and description', () => {
    setup();
    expect(screen.getByRole('alertdialog', { name: '¿Descartar?' })).toHaveAccessibleDescription('Se perderán los cambios.');
    expect(screen.getByText('Confirmación')).toBeInTheDocument();
  });

  it('should call the matching handler for each footer button', async () => {
    const { onCancel, onConfirm } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Descartar' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should focus the confirm action on open', () => {
    setup('danger');
    expect(screen.getByRole('button', { name: 'Descartar' })).toHaveFocus();
  });
});

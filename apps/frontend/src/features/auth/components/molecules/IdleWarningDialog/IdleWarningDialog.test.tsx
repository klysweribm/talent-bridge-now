import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IdleWarningDialog } from './IdleWarningDialog';

describe('IdleWarningDialog', () => {
  it('should show the remaining seconds', () => {
    render(<IdleWarningDialog secondsLeft={42} onStay={vi.fn()} onLogout={vi.fn()} />);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('42 s')).toBeInTheDocument();
  });

  it('should call onStay and onLogout from their buttons', async () => {
    const onStay = vi.fn();
    const onLogout = vi.fn();
    const user = userEvent.setup();
    render(<IdleWarningDialog secondsLeft={10} onStay={onStay} onLogout={onLogout} />);

    await user.click(screen.getByRole('button', { name: 'Seguir conectado' }));
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    expect(onStay).toHaveBeenCalledTimes(1);
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});

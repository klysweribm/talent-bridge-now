import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBanner } from './ErrorBanner';

describe('ErrorBanner', () => {
  it('should render the message in an alert without a button by default', () => {
    render(<ErrorBanner message="Falló" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Falló');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render the action when provided', async () => {
    const onAction = vi.fn();
    render(<ErrorBanner message="Falló" actionLabel="Reintentar" onAction={onAction} />);
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onAction).toHaveBeenCalled();
  });
});

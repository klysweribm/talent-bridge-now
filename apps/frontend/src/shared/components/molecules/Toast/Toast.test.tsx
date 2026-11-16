import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast } from './Toast';

describe('Toast', () => {
  afterEach(() => vi.useRealTimers());

  it('should render the title and message as a status', () => {
    render(<Toast title="Guardado" message="Cambios aplicados" dismissLabel="Cerrar aviso" onDismiss={vi.fn()} />);
    expect(screen.getByRole('status')).toHaveTextContent('GuardadoCambios aplicados');
  });

  it('should dismiss on click of the close button', async () => {
    const onDismiss = vi.fn();
    render(<Toast title="Guardado" dismissLabel="Cerrar aviso" onDismiss={onDismiss} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar aviso' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('should auto-dismiss after 4500ms and not before', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(<Toast title="Guardado" dismissLabel="Cerrar aviso" onDismiss={onDismiss} />);
    act(() => { vi.advanceTimersByTime(4499); });
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1); });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

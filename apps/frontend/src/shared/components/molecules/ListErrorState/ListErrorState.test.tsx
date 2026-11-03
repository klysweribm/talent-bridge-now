import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListErrorState } from './ListErrorState';

describe('ListErrorState', () => {
  it('should show an alert with the message and retry on demand', async () => {
    const onRetry = vi.fn();
    render(<ListErrorState message="Falló la carga" retryLabel="Reintentar" onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Falló la carga');
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onRetry).toHaveBeenCalled();
  });
});

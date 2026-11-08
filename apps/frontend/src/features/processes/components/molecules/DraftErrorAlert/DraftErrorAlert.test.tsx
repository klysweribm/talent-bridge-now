import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DraftErrorAlert } from './DraftErrorAlert';

describe('DraftErrorAlert', () => {
  it('should announce the message and retry on click', async () => {
    const onRetry = vi.fn();
    render(<DraftErrorAlert message="Falló" onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Falló');
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

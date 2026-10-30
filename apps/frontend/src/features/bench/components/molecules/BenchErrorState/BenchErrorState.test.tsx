import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BenchErrorState } from './BenchErrorState';

describe('BenchErrorState', () => {
  it('should show an alert and retry on demand', async () => {
    const onRetry = vi.fn();
    render(<BenchErrorState onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar la banca.');
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onRetry).toHaveBeenCalled();
  });
});

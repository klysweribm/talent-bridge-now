import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProcessStepper } from './ProcessStepper';

describe('ProcessStepper', () => {
  it('should mark the current step with aria-current and list three steps', () => {
    render(<ProcessStepper current="candidates" onNavigate={vi.fn()} disabled={false} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('Candidatos').closest('li')).toHaveAttribute('aria-current', 'step');
    expect(screen.getByText('Datos').closest('li')).not.toHaveAttribute('aria-current');
  });

  it('should let completed steps be clicked and keep future steps non clickable', async () => {
    const onNavigate = vi.fn();
    render(<ProcessStepper current="candidates" onNavigate={onNavigate} disabled={false} />);
    expect(screen.queryByRole('button', { name: /confirmar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /candidatos/i })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /datos/i }));
    expect(onNavigate).toHaveBeenCalledWith('data');
  });

  it('should disable completed steps when disabled', () => {
    render(<ProcessStepper current="confirm" onNavigate={vi.fn()} disabled />);
    expect(screen.getByRole('button', { name: /^datos/i })).toBeDisabled();
  });
});

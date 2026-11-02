import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StepFooter } from './StepFooter';

describe('StepFooter', () => {
  it('should render Atrás and the given actions', async () => {
    const onBack = vi.fn();
    render(<StepFooter backLabel="Atrás" onBack={onBack}><button type="button">Siguiente</button></StepFooter>);
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Atrás' }));
    expect(onBack).toHaveBeenCalled();
  });

  it('should disable Atrás when disabled', () => {
    render(<StepFooter backLabel="Atrás" onBack={vi.fn()} disabled><span /></StepFooter>);
    expect(screen.getByRole('button', { name: 'Atrás' })).toBeDisabled();
  });
});

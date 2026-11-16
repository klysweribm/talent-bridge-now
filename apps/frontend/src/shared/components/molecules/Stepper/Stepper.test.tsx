import { render, screen } from '@testing-library/react';
import { Stepper } from './Stepper';

const STEPS = [{ id: 'a', label: 'Datos', sublabel: 'Paso 1' }, { id: 'b', label: 'Candidatos' }, { id: 'c', label: 'Confirmar' }];

describe('Stepper', () => {
  it('should list every step and mark only the current one with aria-current', () => {
    render(<Stepper steps={STEPS} currentIndex={1} ariaLabel="Progreso" />);
    expect(screen.getByRole('navigation', { name: 'Progreso' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('Candidatos').closest('li')).toHaveAttribute('aria-current', 'step');
    expect(screen.getByText('Datos').closest('li')).not.toHaveAttribute('aria-current');
  });

  it('should announce completed steps to screen readers and show sublabels', () => {
    render(<Stepper steps={STEPS} currentIndex={2} ariaLabel="Progreso" doneLabel="completado" />);
    expect(screen.getAllByText('completado')).toHaveLength(2);
    expect(screen.getByText('Paso 1')).toBeInTheDocument();
  });
});

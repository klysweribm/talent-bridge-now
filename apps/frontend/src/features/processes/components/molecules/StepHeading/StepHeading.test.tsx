import { render, screen } from '@testing-library/react';
import { StepHeading } from './StepHeading';

describe('StepHeading', () => {
  it('should render an h2 that receives focus on mount', () => {
    render(<StepHeading>Datos de la oportunidad</StepHeading>);
    expect(screen.getByRole('heading', { level: 2, name: 'Datos de la oportunidad' })).toHaveFocus();
  });
});

import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('should be indeterminate by default: a progressbar without aria-valuenow', () => {
    render(<ProgressBar label="Analizando CV" />);
    const bar = screen.getByRole('progressbar', { name: 'Analizando CV' });
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(bar).not.toHaveAttribute('aria-valuemin');
  });

  it('should animate by default and stop the animation under reduced motion', () => {
    render(<ProgressBar label="Analizando CV" />);
    const fill = screen.getByRole('progressbar').firstElementChild;
    expect(fill).toHaveClass('animate-progress-indeterminate', 'motion-reduce:animate-none');
  });

  it('should expose aria-valuenow only when a real value is given', () => {
    render(<ProgressBar label="Subiendo" value={40} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '40');
  });
});

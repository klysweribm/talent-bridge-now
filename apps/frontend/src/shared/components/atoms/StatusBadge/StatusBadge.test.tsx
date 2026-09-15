import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('should render the label text', () => {
    render(<StatusBadge variant="success" label="Aprobado" />);
    expect(screen.getByText('Aprobado')).toBeInTheDocument();
  });

  it('should set aria-label to the label prop', () => {
    render(<StatusBadge variant="danger" label="Rechazado" />);
    expect(screen.getByLabelText('Rechazado')).toBeInTheDocument();
  });

  it('should apply success background color', () => {
    render(<StatusBadge variant="success" label="Activo" />);
    expect(screen.getByLabelText('Activo')).toHaveStyle({ backgroundColor: '#defbe6' });
  });

  it('should apply danger background color', () => {
    render(<StatusBadge variant="danger" label="Inactivo" />);
    expect(screen.getByLabelText('Inactivo')).toHaveStyle({ backgroundColor: '#ffebeb' });
  });

  it('should apply warning background color', () => {
    render(<StatusBadge variant="warning" label="Pendiente" />);
    expect(screen.getByLabelText('Pendiente')).toHaveStyle({ backgroundColor: '#fef3d6' });
  });

  it('should NOT render dot indicator when dot=false', () => {
    const { container } = render(<StatusBadge variant="info" label="Info" dot={false} />);
    const dots = container.querySelectorAll('[aria-hidden="true"]');
    expect(dots).toHaveLength(0);
  });

  it('should render dot indicator when dot=true', () => {
    const { container } = render(<StatusBadge variant="success" label="Online" dot />);
    const dot = container.querySelector('[aria-hidden="true"]');
    expect(dot).toBeInTheDocument();
  });

  it('should render all variants without throwing', () => {
    const variants = ['success', 'warning', 'danger', 'info', 'neutral'] as const;
    variants.forEach(variant => {
      const { unmount } = render(<StatusBadge variant={variant} label={variant} />);
      unmount();
    });
  });
});

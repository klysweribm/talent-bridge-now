import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('should render children text', () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  });

  it('should call onClick when clicked and not disabled', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Guardar</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('should not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Guardar</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should render loading spinner and set aria-busy when loading=true', () => {
    render(<Button loading>Guardar</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('should render icon when icon prop is provided', () => {
    render(<Button icon="add">Nuevo</Button>);
    expect(screen.getByText('add')).toBeInTheDocument();
  });

  it('should apply danger variant class when variant=danger', () => {
    render(<Button variant="danger">Eliminar</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-status-danger');
  });

  it('should pass extra HTML attributes to the button element', () => {
    render(<Button data-testid="my-btn">Test</Button>);
    expect(screen.getByTestId('my-btn')).toBeInTheDocument();
  });
});

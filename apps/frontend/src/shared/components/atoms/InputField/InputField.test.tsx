import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputField } from './InputField';

describe('InputField', () => {
  it('should render label and input correctly', () => {
    render(<InputField label="Correo IBM" />);
    expect(screen.getByLabelText('Correo IBM')).toBeInTheDocument();
    expect(screen.getByText('Correo IBM')).toBeInTheDocument();
  });

  it('should show error message and set aria-invalid when error prop is provided', () => {
    render(<InputField label="Correo" error="Correo inválido" />);
    const input = screen.getByLabelText('Correo');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Correo inválido');
  });

  it('should show hint text when no error', () => {
    render(<InputField label="Contraseña" hint="Mínimo 8 caracteres" />);
    expect(screen.getByText('Mínimo 8 caracteres')).toBeInTheDocument();
  });

  it('should NOT show hint text when error is present', () => {
    render(
      <InputField label="Contraseña" error="Campo requerido" hint="Mínimo 8 caracteres" />,
    );
    expect(screen.queryByText('Mínimo 8 caracteres')).not.toBeInTheDocument();
  });

  it('should call onChange when user types', async () => {
    const handleChange = vi.fn();
    render(<InputField label="Nombre" onChange={handleChange} />);
    await userEvent.type(screen.getByLabelText('Nombre'), 'Juan');
    expect(handleChange).toHaveBeenCalled();
  });

  it('should render icon span when icon prop is provided', () => {
    render(<InputField label="Buscar" icon="search" />);
    expect(screen.getByText('search')).toBeInTheDocument();
  });

  it('should use provided id for label association', () => {
    render(<InputField label="Email" id="email-field" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'email-field');
  });
});

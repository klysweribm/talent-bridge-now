import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { PasswordField } from './PasswordField';
import type { TLoginFormValues } from '@features/auth/hooks/useLoginForm';

function Wrapper() {
  const { register } = useForm<TLoginFormValues>();
  return <PasswordField register={register} />;
}

describe('PasswordField', () => {
  it('should toggle password visibility', async () => {
    render(<Wrapper />);
    const input = screen.getByLabelText('Contraseña');
    expect(input).toHaveAttribute('type', 'password');
    await userEvent.click(screen.getByLabelText('Mostrar contraseña'));
    expect(input).toHaveAttribute('type', 'text');
    await userEvent.click(screen.getByLabelText('Ocultar contraseña'));
    expect(input).toHaveAttribute('type', 'password');
  });
});

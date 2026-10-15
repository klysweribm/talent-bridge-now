import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { EmailField } from './EmailField';
import type { TLoginFormValues } from '@features/auth/hooks/useLoginForm';

function Wrapper({ error }: { error?: string }): JSX.Element {
  const { register } = useForm<TLoginFormValues>();
  return <EmailField register={register} error={error} />;
}

describe('EmailField', () => {
  it('should render the email input with its label', () => {
    render(<Wrapper />);
    expect(screen.getByLabelText(/correo corporativo/i)).toBeInTheDocument();
  });

  it('should show the error message when present', () => {
    render(<Wrapper error="Correo inválido" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Correo inválido');
  });
});

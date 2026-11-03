import { render, screen } from '@testing-library/react';
import { SsoLoginButton } from './SsoLoginButton';
import { AUTH_COPY } from '@features/auth/config/auth.copy';

describe('SsoLoginButton', () => {
  it('should render the SSO access button as disabled and declared unavailable', () => {
    render(<SsoLoginButton />);
    const button = screen.getByLabelText('Acceder con IBM w3id SSO');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('title', AUTH_COPY.unavailable);
  });
});

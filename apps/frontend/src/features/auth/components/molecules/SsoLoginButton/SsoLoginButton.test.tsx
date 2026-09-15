import { render, screen } from '@testing-library/react';
import { SsoLoginButton } from './SsoLoginButton';

describe('SsoLoginButton', () => {
  it('should render the SSO access button', () => {
    render(<SsoLoginButton />);
    expect(screen.getByLabelText('Acceder con IBM w3id SSO')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { TrustFooter } from './TrustFooter';
import { AUTH_COPY } from '@features/auth/config/auth.copy';

describe('TrustFooter', () => {
  it('should render the divider, the disabled SSO button and the TLS note', () => {
    render(<TrustFooter />);
    expect(screen.getByText(AUTH_COPY.divider)).toBeInTheDocument();
    expect(screen.getByLabelText(AUTH_COPY.sso)).toBeDisabled();
    expect(screen.getByText(AUTH_COPY.tlsNote)).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { RememberDeviceField } from './RememberDeviceField';
import { AUTH_COPY } from '@features/auth/config/auth.copy';

describe('RememberDeviceField', () => {
  it('should render a disabled checkbox declared as unavailable', () => {
    render(<RememberDeviceField />);
    const box = screen.getByRole('checkbox', { name: AUTH_COPY.rememberDevice });
    expect(box).toBeDisabled();
    expect(screen.getByTitle(AUTH_COPY.unavailable)).toBeInTheDocument();
  });
});

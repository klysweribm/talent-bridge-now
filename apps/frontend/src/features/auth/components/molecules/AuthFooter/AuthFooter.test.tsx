import { render, screen } from '@testing-library/react';
import { AuthFooter } from './AuthFooter';

describe('AuthFooter', () => {
  it('should render the version and footer links', () => {
    render(<AuthFooter />);
    expect(screen.getByText('IBM Talent Bridge v2.4.0')).toBeInTheDocument();
    expect(screen.getByText('Soporte w3 Help')).toBeInTheDocument();
  });
});

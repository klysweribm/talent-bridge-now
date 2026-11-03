import { render, screen } from '@testing-library/react';
import { AuthFooter } from './AuthFooter';
import { BRAND } from '@features/auth/config/brand';

describe('AuthFooter', () => {
  it('should render the brand name, version and footer entries', () => {
    render(<AuthFooter />);
    expect(screen.getByText(`${BRAND.companyName} ${BRAND.productName} ${BRAND.version}`)).toBeInTheDocument();
    expect(screen.getByText('Soporte w3 Help')).toBeInTheDocument();
  });

  it('should not render dead links', () => {
    const { container } = render(<AuthFooter />);
    expect(container.querySelectorAll('a')).toHaveLength(0);
  });
});

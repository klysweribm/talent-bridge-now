import { render, screen } from '@testing-library/react';
import { BrandHeader } from './BrandHeader';
import { BRAND } from '@features/auth/config/brand';

describe('BrandHeader', () => {
  it('should render brand name and SSO badge', () => {
    render(<BrandHeader />);
    expect(screen.getByText('Talent Bridge')).toBeInTheDocument();
    expect(screen.getByText('SSO Activo')).toBeInTheDocument();
  });

  it('should read the product name from the brand config', () => {
    render(<BrandHeader />);
    expect(screen.getByText(BRAND.productName)).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { BrandHeader } from './BrandHeader';

describe('BrandHeader', () => {
  it('should render brand name and SSO badge', () => {
    render(<BrandHeader />);
    expect(screen.getByText('Talent Bridge')).toBeInTheDocument();
    expect(screen.getByText('SSO Activo')).toBeInTheDocument();
  });
});

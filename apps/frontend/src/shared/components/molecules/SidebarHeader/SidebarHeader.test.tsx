import { render, screen } from '@testing-library/react';
import { BRAND } from '@/config/brand';
import { SidebarHeader } from './SidebarHeader';

describe('SidebarHeader', () => {
  it('should show the two-part brand without a collapse toggle', () => {
    render(<SidebarHeader />);

    expect(screen.getByText(BRAND.companyName)).toBeInTheDocument();
    expect(screen.getByText(BRAND.productShortName)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

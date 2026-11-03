import { render, screen } from '@testing-library/react';
import { ShowcaseProfileCard } from './ShowcaseProfileCard';
import { LOGIN_SHOWCASE } from '@features/auth/config/loginShowcase';

describe('ShowcaseProfileCard', () => {
  it('should render the illustrative profile from the showcase constant', () => {
    render(<ShowcaseProfileCard />);
    expect(screen.getByText(LOGIN_SHOWCASE.profile.name)).toBeInTheDocument();
    expect(screen.getByText(LOGIN_SHOWCASE.profile.badge)).toBeInTheDocument();
    expect(screen.getByText(LOGIN_SHOWCASE.profile.initials)).toBeInTheDocument();
  });
});

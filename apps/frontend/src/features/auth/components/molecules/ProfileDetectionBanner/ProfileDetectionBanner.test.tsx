import { render, screen } from '@testing-library/react';
import { ProfileDetectionBanner } from './ProfileDetectionBanner';

describe('ProfileDetectionBanner', () => {
  it('should render the profile detection message', () => {
    render(<ProfileDetectionBanner />);
    expect(screen.getByText('Detección automática de perfil')).toBeInTheDocument();
  });
});

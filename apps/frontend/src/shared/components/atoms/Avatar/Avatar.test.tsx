import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('should render initials from full name', () => {
    render(<Avatar name="Juan Pérez" />);
    expect(screen.getByText('JP')).toBeInTheDocument();
  });

  it('should render only first two initials from long name', () => {
    render(<Avatar name="Juan Carlos Pérez López" />);
    expect(screen.getByText('JC')).toBeInTheDocument();
  });

  it('should render image when imageUrl is provided', () => {
    render(<Avatar name="Ana García" imageUrl="https://example.com/photo.jpg" />);
    const img = screen.getByRole('img', { name: 'Ana García' });
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('should set aria-label to name when rendering initials', () => {
    render(<Avatar name="Carlos López" />);
    expect(screen.getByLabelText('Carlos López')).toBeInTheDocument();
  });

  it('should render correctly with single-word name', () => {
    render(<Avatar name="IBM" />);
    expect(screen.getByText('I')).toBeInTheDocument();
  });

  it('should apply size class sm correctly', () => {
    render(<Avatar name="Test" size="sm" />);
    expect(screen.getByLabelText('Test')).toHaveClass('w-6');
  });

  it('should apply size class lg correctly', () => {
    render(<Avatar name="Test" size="lg" />);
    expect(screen.getByLabelText('Test')).toHaveClass('w-10');
  });
});

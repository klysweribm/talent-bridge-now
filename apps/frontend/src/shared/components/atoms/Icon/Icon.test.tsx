import { render, screen } from '@testing-library/react';
import { Icon } from './Icon';

describe('Icon', () => {
  it('should render the inline SVG fallback when the name has a data definition', () => {
    const { container } = render(<Icon name="mail" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render as a font icon when the name has no SVG definition', () => {
    render(<Icon name="tune" />);
    expect(screen.getByText('tune')).toHaveClass('material-symbols-outlined');
  });

  it('should apply the requested size to the SVG definition', () => {
    const { container } = render(<Icon name="lock" size={32} />);
    expect(container.querySelector('svg')).toHaveAttribute('width', '32');
  });

  it('should apply the requested size to the font icon fallback', () => {
    render(<Icon name="tune" size={32} />);
    expect(screen.getByText('tune')).toHaveStyle({ fontSize: '32px' });
  });

  it('should be hidden from assistive tech since it is purely decorative', () => {
    const { container } = render(<Icon name="mail" />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('should merge a custom className into the wrapper', () => {
    const { container } = render(<Icon name="mail" className="text-primary" />);
    expect(container.querySelector('span')).toHaveClass('text-primary');
  });
});

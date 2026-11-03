import { render } from '@testing-library/react';
import { LoginShowcasePanel } from './LoginShowcasePanel';

describe('LoginShowcasePanel', () => {
  it('should be decorative only: aria-hidden, no headings, no alerts, no product name', () => {
    const { container } = render(<LoginShowcasePanel />);
    const panel = container.firstElementChild as HTMLElement;
    expect(panel).toHaveAttribute('aria-hidden', 'true');
    expect(panel.querySelectorAll('h1,h2,h3,h4,h5,h6,[role="heading"],[role="alert"]')).toHaveLength(0);
    expect(panel.textContent).not.toContain('Talent Bridge');
  });
});

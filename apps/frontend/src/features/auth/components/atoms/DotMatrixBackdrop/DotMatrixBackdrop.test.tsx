import { render } from '@testing-library/react';
import { DotMatrixBackdrop } from './DotMatrixBackdrop';

describe('DotMatrixBackdrop', () => {
  it('should render as a decorative, non-interactive element', () => {
    const { container } = render(<DotMatrixBackdrop />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });
});

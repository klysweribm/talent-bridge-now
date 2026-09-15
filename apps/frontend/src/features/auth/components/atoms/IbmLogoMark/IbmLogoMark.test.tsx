import { render } from '@testing-library/react';
import { IbmLogoMark } from './IbmLogoMark';

describe('IbmLogoMark', () => {
  it('should render an svg mark', () => {
    const { container } = render(<IbmLogoMark />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});

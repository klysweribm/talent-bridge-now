import { render, screen } from '@testing-library/react';
import { AiSuggestedBadge } from './AiSuggestedBadge';

describe('AiSuggestedBadge', () => {
  it('should render the suggested label as text', () => {
    render(<AiSuggestedBadge />);
    expect(screen.getByText('Sugerido por IA')).toBeInTheDocument();
  });
});

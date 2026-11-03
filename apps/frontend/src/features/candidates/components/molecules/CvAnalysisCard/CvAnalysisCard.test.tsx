import { render, screen } from '@testing-library/react';
import { CvAnalysisCard } from './CvAnalysisCard';

describe('CvAnalysisCard', () => {
  it('should show the title, an indeterminate progressbar and the wait text', () => {
    render(<CvAnalysisCard />);
    expect(screen.getByText(/analizando cv/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
    expect(screen.getByRole('status')).toHaveTextContent(/hasta 90 segundos\. no cierres esta página/i);
  });
});

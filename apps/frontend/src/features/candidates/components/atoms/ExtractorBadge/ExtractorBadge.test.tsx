import { render, screen } from '@testing-library/react';
import { ExtractorBadge } from './ExtractorBadge';

describe('ExtractorBadge', () => {
  it.each([
    ['ica', /extraído con ica \(archivo\)/i],
    ['ica-text', /extraído con ica \(texto\)/i],
    ['classic', /extraído con clásica$/i],
  ] as const)('should label the %s extractor', (extractor, label) => {
    render(<ExtractorBadge extractor={extractor} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('should say "Clásica completada con IA" when classic was completed with ica-text', () => {
    render(<ExtractorBadge extractor="classic" completedWith="ica-text" />);
    expect(screen.getByText(/clásica completada con ia/i)).toBeInTheDocument();
  });

  it('should ignore completedWith for non-classic extractors', () => {
    render(<ExtractorBadge extractor="ica" completedWith="ica-text" />);
    expect(screen.queryByText(/completada con ia/i)).not.toBeInTheDocument();
  });
});

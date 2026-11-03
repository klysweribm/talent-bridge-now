import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeFile, makeResult } from '../../../test-utils';
import { CvResultCard } from './CvResultCard';

describe('CvResultCard', () => {
  it('should show name and human size of the chosen file with no keywords before extraction', () => {
    render(<CvResultCard file={new File(['x'.repeat(1536)], 'cv.pdf')} onRemove={vi.fn()} />);
    expect(screen.getByText('cv.pdf')).toBeInTheDocument();
    expect(screen.getByText(/1,5 kb/i)).toBeInTheDocument();
    expect(screen.getByText(/cv seleccionado/i)).toBeInTheDocument();
    expect(screen.queryByText(/palabras clave/i)).not.toBeInTheDocument();
  });

  it('should show the analyzed state and the skill names as chips with the extractor name', () => {
    render(<CvResultCard file={makeFile()} result={makeResult('ica-text')} onRemove={vi.fn()} />);
    expect(screen.getByText(/cv analizado/i)).toBeInTheDocument();
    expect(screen.getByText('Palabras clave identificadas por ICA:')).toBeInTheDocument();
    expect(screen.getByText('Java')).toBeInTheDocument();
    expect(screen.getByText('Kafka')).toBeInTheDocument();
  });

  it('should name the classic extractor when it produced the result', () => {
    render(<CvResultCard file={makeFile()} result={makeResult('classic')} />);
    expect(screen.getByText('Palabras clave identificadas por Clásica:')).toBeInTheDocument();
  });

  it('should omit the keywords block when the draft has no skills', () => {
    const result = makeResult('ica', { draft: {} });
    render(<CvResultCard file={makeFile()} result={result} />);
    expect(screen.queryByText(/palabras clave/i)).not.toBeInTheDocument();
  });

  it('should call onRemove from the "Quitar CV" button and hide it when not removable', async () => {
    const onRemove = vi.fn();
    const { rerender } = render(<CvResultCard file={makeFile()} onRemove={onRemove} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Quitar CV' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    rerender(<CvResultCard file={makeFile()} />);
    expect(screen.queryByRole('button', { name: 'Quitar CV' })).not.toBeInTheDocument();
  });
});

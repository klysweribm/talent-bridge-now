import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CvFileInput } from './CvFileInput';

describe('CvFileInput', () => {
  it('should show the allowed limit before a file is chosen', () => {
    render(<CvFileInput error={null} onSelect={vi.fn()} />);
    expect(screen.getByText(/máximo 5 mb · pdf o docx/i)).toBeInTheDocument();
  });

  it('should show name and human size once a file is chosen', () => {
    render(<CvFileInput file={new File(['x'.repeat(1536)], 'cv.pdf')} error={null} onSelect={vi.fn()} />);
    expect(screen.getByText(/cv\.pdf/)).toHaveTextContent(/1,5 kb/i);
  });

  it('should show the error as an alert instead of the selection', () => {
    render(<CvFileInput file={new File(['x'], 'cv.pdf')} error="El archivo pesa 7,2 MB y el máximo es 5 MB." onSelect={vi.fn()} />);
    expect(screen.getByRole('alert')).toHaveTextContent(/pesa 7,2 mb/i);
    expect(screen.queryByText(/seleccionado/i)).not.toBeInTheDocument();
  });

  it('should report the picked file', async () => {
    const onSelect = vi.fn();
    const file = new File(['x'], 'cv.pdf', { type: 'application/pdf' });
    render(<CvFileInput error={null} onSelect={onSelect} />);
    await userEvent.setup().upload(screen.getByLabelText(/archivo del cv/i), file);
    expect(onSelect).toHaveBeenCalledWith(file);
  });
});

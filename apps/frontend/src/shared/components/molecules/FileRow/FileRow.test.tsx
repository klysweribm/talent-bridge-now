import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileRow } from './FileRow';

describe('FileRow', () => {
  it('should show the file name and size', () => {
    render(<FileRow name="cv.pdf" sizeLabel="1,2 MB" removeLabel="Quitar" onRemove={vi.fn()} />);
    expect(screen.getByText('cv.pdf')).toBeInTheDocument();
    expect(screen.getByText('1,2 MB')).toBeInTheDocument();
  });

  it('should call onRemove from the remove button', async () => {
    const onRemove = vi.fn();
    render(<FileRow name="cv.pdf" removeLabel="Quitar" onRemove={onRemove} />);
    await userEvent.click(screen.getByRole('button', { name: 'Quitar' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});

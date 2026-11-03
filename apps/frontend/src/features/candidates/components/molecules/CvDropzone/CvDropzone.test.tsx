import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CvDropzone } from './CvDropzone';

const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function zone(): HTMLElement {
  return screen.getByTestId('cv-dropzone');
}

function drop(target: HTMLElement, file: File): void {
  fireEvent.drop(target, { dataTransfer: { files: [file], types: ['Files'] } });
}

describe('CvDropzone', () => {
  it('should show the real limit and the accepted formats before a file is chosen', () => {
    render(<CvDropzone error={null} onSelect={vi.fn()} />);
    expect(screen.getByText(/arrastra el cv aquí o haz clic para seleccionar/i)).toBeInTheDocument();
    expect(screen.getByText(/formatos soportados: pdf o docx \(máximo 5 mb\)/i)).toBeInTheDocument();
  });

  it('should keep the accessible name "Archivo del CV" on the hidden input', () => {
    render(<CvDropzone error={null} onSelect={vi.fn()} />);
    expect(screen.getByLabelText(/archivo del cv/i)).toHaveAttribute('type', 'file');
  });

  it('should report a PDF dropped on the zone', () => {
    const onSelect = vi.fn();
    const file = new File(['x'], 'cv.pdf', { type: 'application/pdf' });
    render(<CvDropzone error={null} onSelect={onSelect} />);
    drop(zone(), file);
    expect(onSelect).toHaveBeenCalledWith(file);
  });

  it('should report a DOCX dropped on the zone', () => {
    const onSelect = vi.fn();
    const file = new File(['x'], 'cv.docx', { type: DOCX });
    render(<CvDropzone error={null} onSelect={onSelect} />);
    drop(zone(), file);
    expect(onSelect).toHaveBeenCalledWith(file);
  });

  it('should pass a dropped .doc to onSelect so the validation message is shown by the caller', () => {
    const onSelect = vi.fn();
    const file = new File(['x'], 'cv.doc', { type: 'application/msword' });
    render(<CvDropzone error="Solo se aceptan archivos PDF o DOCX." onSelect={onSelect} />);
    drop(zone(), file);
    expect(onSelect).toHaveBeenCalledWith(file);
    expect(screen.getByRole('alert')).toHaveTextContent(/pdf o docx/i);
  });

  it('should ignore a drop while disabled', () => {
    const onSelect = vi.fn();
    render(<CvDropzone error={null} onSelect={onSelect} disabled />);
    drop(zone(), new File(['x'], 'cv.pdf'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('should highlight the zone while dragging over it', () => {
    render(<CvDropzone error={null} onSelect={vi.fn()} />);
    fireEvent.dragEnter(zone(), { dataTransfer: { types: ['Files'] } });
    expect(zone()).toHaveAttribute('data-state', 'dragging');
    fireEvent.dragLeave(zone());
    expect(zone()).toHaveAttribute('data-state', 'idle');
  });

  it('should report the picked file on click through the input', async () => {
    const onSelect = vi.fn();
    const file = new File(['x'], 'cv.pdf', { type: 'application/pdf' });
    render(<CvDropzone error={null} onSelect={onSelect} />);
    await userEvent.setup().upload(screen.getByLabelText(/archivo del cv/i), file);
    expect(onSelect).toHaveBeenCalledWith(file);
  });

  it('should open the file picker with Enter and Space', async () => {
    const user = userEvent.setup();
    render(<CvDropzone error={null} onSelect={vi.fn()} />);
    const input = screen.getByLabelText(/archivo del cv/i);
    const click = vi.spyOn(input, 'click');
    zone().focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(click).toHaveBeenCalledTimes(2);
  });

  it('should describe the zone by the limit text and by the error when there is one', () => {
    render(<CvDropzone error="El archivo está vacío." onSelect={vi.fn()} />);
    expect(screen.getByLabelText(/archivo del cv/i)).toHaveAttribute('aria-invalid', 'true');
    expect(zone()).toHaveAccessibleDescription(/formatos soportados.*el archivo está vacío/i);
    expect(screen.getByRole('alert')).toHaveTextContent(/vacío/i);
    expect(zone()).toHaveAttribute('data-state', 'error');
  });
});

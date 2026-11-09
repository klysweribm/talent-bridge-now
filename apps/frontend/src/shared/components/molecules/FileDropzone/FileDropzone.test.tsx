import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileDropzone, type FileDropzoneProps } from './FileDropzone';

const BASE: FileDropzoneProps = {
  idPrefix: 'doc', testId: 'doc-dropzone', label: 'Archivo del documento', prompt: 'Suelta el documento aquí',
  supportedHint: 'Formatos: PDF (máximo 5 MB)', accept: '.pdf,application/pdf', error: null, onSelect: vi.fn(),
};

function zone(): HTMLElement {
  return screen.getByTestId('doc-dropzone');
}

describe('FileDropzone', () => {
  it('should show the prompt and the supported hint with the given ids', () => {
    render(<FileDropzone {...BASE} />);
    expect(screen.getByText('Suelta el documento aquí')).toHaveAttribute('id', 'doc-file-prompt');
    expect(screen.getByText('Formatos: PDF (máximo 5 MB)')).toHaveAttribute('id', 'doc-file-limit');
    expect(screen.getByLabelText('Archivo del documento')).toHaveAttribute('accept', '.pdf,application/pdf');
  });

  it('should report a file dropped on the zone', () => {
    const onSelect = vi.fn();
    const file = new File(['x'], 'a.pdf', { type: 'application/pdf' });
    render(<FileDropzone {...BASE} onSelect={onSelect} />);
    fireEvent.drop(zone(), { dataTransfer: { files: [file], types: ['Files'] } });
    expect(onSelect).toHaveBeenCalledWith(file);
  });

  it('should report the file picked through the input', async () => {
    const onSelect = vi.fn();
    const file = new File(['x'], 'a.pdf', { type: 'application/pdf' });
    render(<FileDropzone {...BASE} onSelect={onSelect} />);
    await userEvent.setup().upload(screen.getByLabelText('Archivo del documento'), file);
    expect(onSelect).toHaveBeenCalledWith(file);
  });

  it('should ignore a drop and disable the input while disabled', () => {
    const onSelect = vi.fn();
    render(<FileDropzone {...BASE} onSelect={onSelect} disabled />);
    fireEvent.drop(zone(), { dataTransfer: { files: [new File(['x'], 'a.pdf')], types: ['Files'] } });
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Archivo del documento')).toBeDisabled();
  });

  it('should open the picker with Enter and Space', async () => {
    const user = userEvent.setup();
    render(<FileDropzone {...BASE} />);
    const click = vi.spyOn(screen.getByLabelText('Archivo del documento'), 'click');
    zone().focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(click).toHaveBeenCalledTimes(2);
  });

  it('should highlight the zone while dragging over it', () => {
    render(<FileDropzone {...BASE} />);
    fireEvent.dragEnter(zone(), { dataTransfer: { types: ['Files'] } });
    expect(zone()).toHaveAttribute('data-state', 'dragging');
    fireEvent.dragLeave(zone());
    expect(zone()).toHaveAttribute('data-state', 'idle');
  });

  it('should announce the error and describe the zone by it', () => {
    render(<FileDropzone {...BASE} error="El archivo está vacío." />);
    expect(screen.getByRole('alert')).toHaveTextContent('El archivo está vacío.');
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'doc-file-error');
    expect(zone()).toHaveAccessibleDescription(/formatos.*el archivo está vacío/i);
    expect(zone()).toHaveAttribute('data-state', 'error');
  });
});

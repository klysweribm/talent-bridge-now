import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DRAFT_COPY } from '../../../config/opportunityDraft.copy';
import { BrochureDropzone } from './BrochureDropzone';

describe('BrochureDropzone', () => {
  it('should show the brochure prompt and the supported formats with the limit', () => {
    render(<BrochureDropzone onSelect={vi.fn()} disabled={false} />);
    expect(screen.getByText(DRAFT_COPY.brochure.prompt)).toBeInTheDocument();
    expect(screen.getByText(/PDF, DOCX, MD o TXT \(máximo 5 MB\)/)).toBeInTheDocument();
  });

  it('should report the picked file', async () => {
    const onSelect = vi.fn();
    const file = new File(['x'], 'brochure.pdf', { type: 'application/pdf' });
    render(<BrochureDropzone onSelect={onSelect} disabled={false} />);
    await userEvent.setup().upload(screen.getByLabelText(DRAFT_COPY.brochure.fileLabel), file);
    expect(onSelect).toHaveBeenCalledWith(file);
  });

  it('should disable the input while disabled', () => {
    render(<BrochureDropzone onSelect={vi.fn()} disabled />);
    expect(screen.getByLabelText(DRAFT_COPY.brochure.fileLabel)).toBeDisabled();
  });
});

import { render, screen } from '@testing-library/react';
import { DraftNotices } from './DraftNotices';

describe('DraftNotices', () => {
  it('should render nothing without anything to say', () => {
    const { container } = render(<DraftNotices applied={false} missing={[]} skipped={[]} warnings={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should name missing and skipped fields and show warnings verbatim', () => {
    render(<DraftNotices applied missing={['clientName']} skipped={['title']} warnings={['Aviso del backend']} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/Por completar.*Cliente/)).toBeInTheDocument();
    expect(screen.getByText(/No sobrescrito.*Título/)).toBeInTheDocument();
    expect(screen.getByText('Aviso del backend')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import type { IProcessTechnicalRef } from '@ibm-talent-bridge/shared-types';
import { TechnicalRefCard } from './TechnicalRefCard';

const REF: IProcessTechnicalRef = {
  id: 'tr1', fullName: 'Carlos Méndez', email: 'carlos@ibm.com', role: 'technical_ref', band: 9, description: 'Arquitecto Java', status: 'active',
};

describe('TechnicalRefCard', () => {
  it('should render name, description, email and band', () => {
    render(<TechnicalRefCard technicalRef={REF} />);
    expect(screen.getByText('Carlos Méndez')).toBeInTheDocument();
    expect(screen.getByText('Arquitecto Java')).toBeInTheDocument();
    expect(screen.getByText('carlos@ibm.com')).toBeInTheDocument();
    expect(screen.getByText('Band 9')).toBeInTheDocument();
    expect(screen.queryByText('Inactivo')).not.toBeInTheDocument();
  });

  it('should show initials when there is no avatar image', () => {
    render(<TechnicalRefCard technicalRef={REF} />);
    expect(screen.getByText('CM')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should show the image when avatarUrl exists', () => {
    render(<TechnicalRefCard technicalRef={{ ...REF, avatarUrl: 'https://x/a.png' }} />);
    expect(screen.getByRole('img', { name: 'Carlos Méndez' })).toHaveAttribute('src', 'https://x/a.png');
  });

  it('should omit the band chip when band is null', () => {
    render(<TechnicalRefCard technicalRef={{ ...REF, band: null }} />);
    expect(screen.queryByText(/Band/)).not.toBeInTheDocument();
    expect(screen.queryByText('null')).not.toBeInTheDocument();
  });

  it('should omit the subtitle when description is empty', () => {
    const { container } = render(<TechnicalRefCard technicalRef={{ ...REF, description: '' }} />);
    expect(container.querySelectorAll('p')).toHaveLength(2);
    expect(screen.queryByText('null')).not.toBeInTheDocument();
  });

  it('should flag an inactive referent', () => {
    render(<TechnicalRefCard technicalRef={{ ...REF, status: 'inactive' }} />);
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
  });
});

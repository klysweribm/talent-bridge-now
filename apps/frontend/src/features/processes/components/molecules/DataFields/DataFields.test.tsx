import { render, screen } from '@testing-library/react';
import { DataFields, type DataFieldsProps } from './DataFields';

const PROPS: DataFieldsProps = {
  title: 'abc', clientName: '', onTitle: vi.fn(), onClient: vi.fn(), onBlurTitle: vi.fn(), onBlurClient: vi.fn(),
  isRecruiter: true, userOptions: [{ id: 'u1', fullName: 'Ana' }], userValue: '', onUser: vi.fn(), onBlurUser: vi.fn(),
};

describe('DataFields', () => {
  it('should show the counter and the PM selector for a recruiter', () => {
    render(<DataFields {...PROPS} />);
    expect(screen.getByText(/3\/200/)).toBeInTheDocument();
    expect(screen.getByLabelText('Project Manager *')).toBeInTheDocument();
  });

  it('should show the optional recruiter selector with Sin asignar for a PM', () => {
    render(<DataFields {...PROPS} isRecruiter={false} />);
    expect(screen.getByLabelText('Reclutador')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Sin asignar' })).toBeInTheDocument();
  });
});

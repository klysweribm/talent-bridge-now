import { render, screen } from '@testing-library/react';
import { AvatarGroup } from './AvatarGroup';

const SAMPLE = [
  { name: 'Ana García' },
  { name: 'Carlos López' },
  { name: 'María Rodríguez' },
  { name: 'Juan Pérez' },
  { name: 'Laura Martínez' },
];

describe('AvatarGroup', () => {
  it('should render avatars with aria-labels for each name', () => {
    render(<AvatarGroup avatars={SAMPLE.slice(0, 3)} />);
    expect(screen.getByLabelText('Ana García')).toBeInTheDocument();
    expect(screen.getByLabelText('Carlos López')).toBeInTheDocument();
    expect(screen.getByLabelText('María Rodríguez')).toBeInTheDocument();
  });

  it('should render group container with total count aria-label', () => {
    render(<AvatarGroup avatars={SAMPLE.slice(0, 3)} />);
    expect(screen.getByLabelText('3 participantes')).toBeInTheDocument();
  });

  it('should show overflow counter when avatars > max', () => {
    render(<AvatarGroup avatars={SAMPLE} max={3} />);
    expect(screen.getByLabelText('+2 más')).toBeInTheDocument();
  });

  it('should NOT show overflow counter when count equals max', () => {
    render(<AvatarGroup avatars={SAMPLE.slice(0, 4)} max={4} />);
    expect(screen.queryByLabelText(/\+\d+ más/)).not.toBeInTheDocument();
  });

  it('should render only max avatars when exceeds max', () => {
    render(<AvatarGroup avatars={SAMPLE} max={2} />);
    expect(screen.getByLabelText('Ana García')).toBeInTheDocument();
    expect(screen.getByLabelText('Carlos López')).toBeInTheDocument();
    expect(screen.queryByLabelText('María Rodríguez')).not.toBeInTheDocument();
    expect(screen.getByLabelText('+3 más')).toBeInTheDocument();
  });

  it('should render empty group without error when avatars is empty', () => {
    render(<AvatarGroup avatars={[]} />);
    expect(screen.getByLabelText('0 participantes')).toBeInTheDocument();
  });
});

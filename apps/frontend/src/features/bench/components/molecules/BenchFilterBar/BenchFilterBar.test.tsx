import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BenchFilterBar, type BenchFilterBarProps } from './BenchFilterBar';

function setup(overrides: Partial<BenchFilterBarProps> = {}): BenchFilterBarProps {
  const props: BenchFilterBarProps = {
    skillOptions: ['Java', 'Go'], skills: [], seniority: [], availableBy: undefined, country: undefined,
    onSkillsChange: vi.fn(), onSeniorityChange: vi.fn(), onAvailableByChange: vi.fn(),
    onCountryChange: vi.fn(), onClear: vi.fn(), ...overrides,
  };
  render(<BenchFilterBar {...props} />);
  return props;
}

describe('BenchFilterBar', () => {
  it('should render every control', () => {
    setup();
    expect(screen.getByLabelText('Skills')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ssr' })).toBeInTheDocument();
    expect(screen.getByLabelText('Disponible antes de')).toBeInTheDocument();
    expect(screen.getByLabelText('País')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Limpiar filtros' })).toBeInTheDocument();
  });

  it('should reflect the current values', () => {
    setup({ availableBy: '2026-11-05', country: 'Chile' });
    expect(screen.getByLabelText('Disponible antes de')).toHaveValue('2026-11-05');
    expect(screen.getByLabelText('País')).toHaveValue('Chile');
  });

  it('should call the callbacks', async () => {
    const props = setup();
    await userEvent.selectOptions(screen.getByLabelText('País'), 'Perú');
    await userEvent.type(screen.getByLabelText('Disponible antes de'), '2026-11-05');
    await userEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(props.onCountryChange).toHaveBeenCalledWith('Perú');
    expect(props.onAvailableByChange).toHaveBeenCalledWith('2026-11-05');
    expect(props.onClear).toHaveBeenCalled();
  });

  it('should send undefined when the country is reset to "Todos"', async () => {
    const props = setup({ country: 'Chile' });
    await userEvent.selectOptions(screen.getByLabelText('País'), 'Todos');
    expect(props.onCountryChange).toHaveBeenCalledWith(undefined);
  });
});

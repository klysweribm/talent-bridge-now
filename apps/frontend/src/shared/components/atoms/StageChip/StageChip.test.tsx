import { render, screen } from '@testing-library/react';
import { StageChip } from './StageChip';
import { STAGE_CHIP_STYLES, PROCESS_STAGES } from '@/config/design-tokens';

describe('StageChip', () => {
  it('should render label for "Inicial" stage', () => {
    render(<StageChip stage="Inicial" />);
    expect(screen.getByText('Inicial')).toBeInTheDocument();
  });

  it('should render label for "Entrevista Técnica" stage', () => {
    render(<StageChip stage="Entrevista Técnica" />);
    expect(screen.getByText('Entrevista Técnica')).toBeInTheDocument();
  });

  it('should apply correct background color from STAGE_CHIP_STYLES', () => {
    render(<StageChip stage="1ra Entrevista" />);
    const chip = screen.getByLabelText('Etapa: 1ra Entrevista');
    expect(chip).toHaveStyle({
      backgroundColor: STAGE_CHIP_STYLES['1ra Entrevista'].bg,
    });
  });

  it('should apply correct text color from STAGE_CHIP_STYLES', () => {
    render(<StageChip stage="Cierre" />);
    const chip = screen.getByLabelText('Etapa: Cierre');
    expect(chip).toHaveStyle({ color: STAGE_CHIP_STYLES['Cierre'].text });
  });

  it('should set aria-label with stage name', () => {
    render(<StageChip stage="Retroalimentación" />);
    expect(screen.getByLabelText('Etapa: Retroalimentación')).toBeInTheDocument();
  });

  it('should render all defined stages without throwing', () => {
    PROCESS_STAGES.forEach(stage => {
      const { unmount } = render(<StageChip stage={stage} />);
      unmount();
    });
  });
});

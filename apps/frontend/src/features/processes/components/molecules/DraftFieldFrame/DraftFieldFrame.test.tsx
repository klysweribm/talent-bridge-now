import { render, screen } from '@testing-library/react';
import { DraftFieldFrame } from './DraftFieldFrame';

describe('DraftFieldFrame', () => {
  it('should show the badge when the field is suggested', () => {
    render(<DraftFieldFrame mark="suggested"><input aria-label="campo" /></DraftFieldFrame>);
    expect(screen.getByText('Sugerido por ICA')).toBeInTheDocument();
  });

  it('should show the to-complete hint (text, not only color) when the field is missing', () => {
    render(<DraftFieldFrame mark="missing"><input aria-label="campo" /></DraftFieldFrame>);
    expect(screen.getByText('La IA no pudo inferirlo: complétalo')).toBeInTheDocument();
    expect(screen.queryByText('Sugerido por ICA')).not.toBeInTheDocument();
  });

  it('should render only the field when there is no mark', () => {
    render(<DraftFieldFrame><input aria-label="campo" /></DraftFieldFrame>);
    expect(screen.getByLabelText('campo')).toBeInTheDocument();
    expect(screen.queryByText(/IA/)).not.toBeInTheDocument();
  });
});

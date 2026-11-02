import { render, screen } from '@testing-library/react';
import { ExtraItem } from './ExtraItem';

describe('ExtraItem', () => {
  it('should render title, subtitle, meta and body as a list item', () => {
    render(<ul><ExtraItem title="Backend Dev" subtitle="Empresa" meta="2020 – 2023" body="Detalle" /></ul>);
    expect(screen.getByRole('listitem')).toHaveTextContent(/Backend Dev.*Empresa.*2020 – 2023.*Detalle/s);
  });

  it('should omit absent parts', () => {
    render(<ul><ExtraItem title="Solo título" /></ul>);
    expect(screen.getByRole('listitem')).toHaveTextContent('Solo título');
  });
});

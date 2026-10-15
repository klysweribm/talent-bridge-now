import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { JSX } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

function Bomb(): JSX.Element {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  // El propio render de React vuelca el error a console.error — lo silenciamos
  // en este describe para no ensuciar la salida de test con el stack esperado.
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render children when there is no error', () => {
    render(<ErrorBoundary><p>Contenido normal</p></ErrorBoundary>);
    expect(screen.getByText('Contenido normal')).toBeInTheDocument();
  });

  it('should render a friendly fallback when a child throws', () => {
    render(<ErrorBoundary><Bomb /></ErrorBoundary>);
    expect(screen.getByRole('heading', { name: /algo salió mal/i })).toBeInTheDocument();
  });

  it('should allow retrying after an error', async () => {
    render(<ErrorBoundary><Bomb /></ErrorBoundary>);
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(screen.getByRole('heading', { name: /algo salió mal/i })).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('should render input with default placeholder', () => {
    render(<SearchBar />);
    expect(screen.getByRole('searchbox', { name: 'Buscar...' })).toBeInTheDocument();
  });

  it('should render input with custom placeholder', () => {
    render(<SearchBar placeholder="Buscar candidatos" />);
    expect(screen.getByRole('searchbox', { name: 'Buscar candidatos' })).toBeInTheDocument();
  });

  it('should call onChange when user types', async () => {
    const handleChange = vi.fn();
    render(<SearchBar onChange={handleChange} />);
    await userEvent.type(screen.getByRole('searchbox'), 'Juan');
    expect(handleChange).toHaveBeenCalled();
  });

  it('should NOT show clear button when value is empty', () => {
    render(<SearchBar value="" onClear={vi.fn()} onChange={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Limpiar búsqueda' })).not.toBeInTheDocument();
  });

  it('should show clear button when value is not empty and onClear is provided', () => {
    render(<SearchBar value="Juan" onClear={vi.fn()} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Limpiar búsqueda' })).toBeInTheDocument();
  });

  it('should call onClear when clear button is clicked', async () => {
    const handleClear = vi.fn();
    render(<SearchBar value="Juan" onClear={handleClear} onChange={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }));
    expect(handleClear).toHaveBeenCalledOnce();
  });

  it('should show search icon by default', () => {
    render(<SearchBar />);
    expect(screen.getByText('search')).toBeInTheDocument();
  });

  it('should show progress icon when loading=true', () => {
    render(<SearchBar loading />);
    expect(screen.getByText('progress_activity')).toBeInTheDocument();
  });
});

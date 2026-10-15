import type { InputHTMLAttributes } from 'react';

export interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly placeholder?: string;
  readonly onClear?:     () => void;
  readonly loading?:     boolean;
  readonly className?:   string;
}

function buildInputClassName(canClear: boolean): string {
  return [
    'w-full h-10 pl-8 pr-sm rounded text-body-md',
    'bg-surface-card border border-[#8d8d8d] text-text-primary',
    'placeholder:text-[#a8a8a8]',
    'focus:outline-2 focus:outline-primary-interactive focus:border-transparent',
    canClear ? 'pr-8' : '',
  ].join(' ');
}

interface IClearButtonProps {
  readonly show:    boolean;
  readonly onClear: () => void;
}

function ClearButton({ show, onClear }: IClearButtonProps): JSX.Element | null {
  if (!show) return null;

  return (
    <button
      type="button"
      aria-label="Limpiar búsqueda"
      onClick={onClear}
      className="absolute right-sm text-text-secondary hover:text-text-primary"
    >
      <span aria-hidden="true" className="material-symbols-outlined text-[18px]">close</span>
    </button>
  );
}

export function SearchBar({
  placeholder = 'Buscar...',
  onClear,
  loading     = false,
  className   = '',
  value,
  ...rest
}: SearchBarProps): JSX.Element {
  const canClear = Boolean(value) && Boolean(onClear);

  return (
    <div className={`relative flex items-center ${className}`}>
      <span
        aria-hidden="true"
        className="material-symbols-outlined absolute left-sm text-[18px] text-text-secondary pointer-events-none"
      >
        {loading ? 'progress_activity' : 'search'}
      </span>

      <input
        {...rest}
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        className={buildInputClassName(canClear)}
      />

      <ClearButton show={canClear} onClear={onClear ?? (() => undefined)} />
    </div>
  );
}

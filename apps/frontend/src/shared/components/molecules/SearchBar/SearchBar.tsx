import type { InputHTMLAttributes } from 'react';

export interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly placeholder?: string;
  readonly onClear?:     () => void;
  readonly loading?:     boolean;
  readonly className?:   string;
}

function buildInputClassName(canClear: boolean): string {
  return [
    'w-full h-12 pl-10 rounded-none text-body bg-transparent border-0 text-carbon-gray-100',
    'placeholder:text-carbon-gray-60',
    'focus:outline-2 focus:outline-offset-[-2px] focus:outline-carbon-blue-60',
    canClear ? 'pr-10' : 'pr-base',
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
      className="absolute right-sm text-carbon-gray-70 hover:text-carbon-gray-100"
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
    <div className={`relative flex items-center bg-white ${className}`}>
      <span
        aria-hidden="true"
        className="material-symbols-outlined absolute left-base text-[16px] text-carbon-gray-70 pointer-events-none"
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

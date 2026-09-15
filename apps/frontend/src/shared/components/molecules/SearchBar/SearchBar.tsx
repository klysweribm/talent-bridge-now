import type { InputHTMLAttributes } from 'react';

export interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly placeholder?: string;
  readonly onClear?:     () => void;
  readonly loading?:     boolean;
  readonly className?:   string;
}

export function SearchBar({
  placeholder = 'Buscar...',
  onClear,
  loading     = false,
  className   = '',
  value,
  ...rest
}: SearchBarProps) {
  const hasValue = Boolean(value);

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
        className={[
          'w-full h-10 pl-8 pr-sm rounded text-body-md',
          'bg-surface-card border border-[#8d8d8d] text-text-primary',
          'placeholder:text-[#a8a8a8]',
          'focus:outline-2 focus:outline-primary-interactive focus:border-transparent',
          hasValue && onClear ? 'pr-8' : '',
        ].join(' ')}
      />

      {hasValue && onClear && (
        <button
          type="button"
          aria-label="Limpiar búsqueda"
          onClick={onClear}
          className="absolute right-sm text-text-secondary hover:text-text-primary"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
            close
          </span>
        </button>
      )}
    </div>
  );
}

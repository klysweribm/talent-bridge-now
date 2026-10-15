/**
 * button.constants — tipos y mapas de clases Tailwind por variante/tamaño.
 * Extraído de `Button.tsx` (DT-006) para mantener el componente bajo el
 * límite de líneas de un atom.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize    = 'sm' | 'md';

export const VARIANT_CLASSES: Readonly<Record<ButtonVariant, string>> = {
  primary:
    'bg-primary-interactive text-white hover:bg-primary-container active:bg-[#002d9c]',
  secondary:
    'bg-transparent border border-primary-interactive text-primary-interactive hover:bg-[#edf5ff]',
  ghost:
    'bg-transparent text-primary-interactive hover:bg-[#ebebeb]',
  danger:
    'bg-status-danger text-white hover:bg-[#ba1b23]',
} as const;

export const SIZE_CLASSES: Readonly<Record<ButtonSize, string>> = {
  sm: 'h-8 px-base text-body-md',
  md: 'h-10 px-base text-body-md-medium',
} as const;

export const BUTTON_BASE_CLASSES = [
  'inline-flex items-center justify-center gap-xs rounded font-medium',
  'transition-colors duration-150 focus-visible:outline-2',
  'disabled:opacity-50 disabled:cursor-not-allowed',
] as const;

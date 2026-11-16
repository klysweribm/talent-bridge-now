/**
 * button.constants — tipos y mapas de clases Tailwind por variante/tamaño.
 * Extraído de `Button.tsx` (DT-006) para mantener el componente bajo el
 * límite de líneas de un atom. Estilo IBM Future Now: sin radio, texto a la izquierda.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'danger-outline';
export type ButtonSize    = 'sm' | 'md' | 'lg' | 'xl';

export const VARIANT_CLASSES: Readonly<Record<ButtonVariant, string>> = {
  primary:
    'bg-carbon-blue-60 text-white hover:bg-carbon-blue-60-hover active:bg-carbon-blue-80',
  secondary:
    'bg-carbon-gray-80 text-white hover:bg-carbon-gray-80-hover active:bg-carbon-gray-100',
  ghost:
    'bg-transparent text-carbon-blue-60 hover:bg-carbon-gray-hover',
  danger:
    'bg-carbon-red text-white hover:bg-carbon-red-hover',
  outline:
    'bg-transparent border border-carbon-blue-60 text-carbon-blue-60 hover:bg-carbon-blue-60 hover:text-white',
  'danger-outline':
    'bg-transparent border border-carbon-red text-carbon-red hover:bg-carbon-red hover:text-white',
} as const;

/** 32 / 40 / 48 / 64 px (xl: pies de panel y diálogo); padding derecho amplio reservado para el icono del prototipo. */
export const SIZE_CLASSES: Readonly<Record<ButtonSize, string>> = {
  sm: 'h-8 pl-base pr-xl text-body',
  md: 'h-10 pl-base pr-2xl text-body',
  lg: 'h-12 pl-base pr-2xl text-body',
  xl: 'h-16 pl-base pr-2xl text-body',
} as const;

export const BUTTON_BASE_CLASSES = [
  'relative inline-flex items-center justify-start gap-sm rounded-none text-left',
  'transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-carbon-blue-60',
  'disabled:bg-carbon-gray-30 disabled:text-carbon-gray-50 disabled:border-transparent disabled:cursor-not-allowed',
] as const;

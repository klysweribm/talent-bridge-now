/**
 * avatar.utils — helpers puros usados por `Avatar` (DT-005), extraídos para
 * mantener el componente bajo el límite de líneas de un atom.
 */

export type AvatarSize = 'sm' | 'md' | 'lg';

export const AVATAR_SIZE_CLASSES: Readonly<Record<AvatarSize, string>> = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-[12px]',
  lg: 'w-10 h-10 text-[14px]',
} as const;

const AVATAR_PALETTE = [
  '#0043ce', '#0f62fe', '#004ccd', '#6929c4',
  '#003099', '#005d5d', '#9f1853', '#a2191f',
] as const;

/** Genera iniciales a partir del nombre completo (máx 2 letras) */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');
}

/** Deriva un color de fondo estable desde el nombre (determinístico) */
export function getColorFromName(name: string): string {
  const index = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index] ?? AVATAR_PALETTE[0];
}

export function avatarClassName(size: AvatarSize, variant: 'image' | 'initials', className: string): string {
  const base = variant === 'image'
    ? ['rounded-full object-cover flex-shrink-0']
    : ['rounded-full flex-shrink-0 inline-flex items-center justify-center', 'font-medium text-white select-none'];
  return [...base, AVATAR_SIZE_CLASSES[size], className].join(' ');
}

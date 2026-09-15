export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  readonly name:      string;
  readonly imageUrl?: string;
  readonly size?:     AvatarSize;
  readonly className?: string;
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-[12px]',
  lg: 'w-10 h-10 text-[14px]',
} as const;

/** Genera iniciales a partir del nombre completo (máx 2 letras) */
function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');
}

/** Derivar color de fondo estable desde el nombre (determinístico) */
function getColorFromName(name: string): string {
  const PALETTE = [
    '#0043ce', '#0f62fe', '#004ccd', '#6929c4',
    '#003099', '#005d5d', '#9f1853', '#a2191f',
  ] as const;
  const index = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % PALETTE.length;
  return PALETTE[index] ?? PALETTE[0];
}

export function Avatar({ name, imageUrl, size = 'md', className = '' }: AvatarProps) {
  const initials = getInitials(name);
  const bg       = getColorFromName(name);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={[
          'rounded-full object-cover flex-shrink-0',
          SIZE_CLASSES[size],
          className,
        ].join(' ')}
      />
    );
  }

  return (
    <span
      aria-label={name}
      title={name}
      style={{ backgroundColor: bg }}
      className={[
        'rounded-full flex-shrink-0 inline-flex items-center justify-center',
        'font-medium text-white select-none',
        SIZE_CLASSES[size],
        className,
      ].join(' ')}
    >
      {initials}
    </span>
  );
}

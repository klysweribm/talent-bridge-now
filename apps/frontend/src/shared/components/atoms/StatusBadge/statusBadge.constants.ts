/**
 * statusBadge.constants — clases Tailwind (tokens Carbon) por variante de `StatusBadge`.
 * `bg`/`text` colorean la pill; `dot` el punto de 6px.
 */
export type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export const STATUS_VARIANT_CLASSES: Readonly<Record<StatusVariant, { readonly pill: string; readonly dot: string }>> = {
  success: { pill: 'bg-carbon-green-tag-bg text-carbon-green-tag-text', dot: 'bg-carbon-green' },
  warning: { pill: 'bg-carbon-yellow-tag-bg text-carbon-yellow-tag-text', dot: 'bg-carbon-yellow-dot' },
  danger:  { pill: 'bg-carbon-red-10 text-carbon-red', dot: 'bg-carbon-red' },
  info:    { pill: 'bg-carbon-blue-20 text-carbon-blue-80', dot: 'bg-carbon-blue-60' },
  neutral: { pill: 'bg-carbon-gray-20 text-carbon-gray-100', dot: 'bg-carbon-gray-60' },
} as const;

export const STATUS_PILL_BASE = 'inline-flex items-center gap-[6px] h-6 px-sm rounded-pill text-label whitespace-nowrap select-none';

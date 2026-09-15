// Atom — máx 50 líneas. Puramente visual, cero estado de negocio, cero hooks
// de datos. Recibe todo por props. Referencia real que ya cumple esto:
// apps/frontend/src/shared/components/atoms/StageChip/StageChip.tsx
//
// ❌ NO hacer: copiar un <span> con style={{ color: '#0043ce' }} literal
//    tomado directo del code.html de Stitch. Usa clases Tailwind o, si el
//    valor es dinámico (varía según prop), un token de `config/design-tokens.ts`.

export interface StatusDotProps {
  readonly status:     'online' | 'offline' | 'busy';
  readonly className?: string;
}

const STATUS_STYLES = {
  online:  'bg-status-success',
  offline: 'bg-outline-variant',
  busy:    'bg-status-warning',
} as const;

export function StatusDot({ status, className = '' }: StatusDotProps) {
  return (
    <span
      role="status"
      aria-label={`Estado: ${status}`}
      className={[
        'inline-block w-2 h-2 rounded-full',
        STATUS_STYLES[status],
        className,
      ].join(' ')}
    />
  );
}

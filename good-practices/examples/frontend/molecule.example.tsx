// Molecule — máx 90 líneas. Compone atoms. Recibe todo por props: NUNCA
// llama useQuery ni useStore aquí (eso es exclusivo del organism/page).
// Referencias reales que ya cumplen esto:
// apps/frontend/src/shared/components/molecules/KpiCard/KpiCard.tsx
// apps/frontend/src/shared/components/molecules/InterviewCard/InterviewCard.tsx

import { StatusDot } from './atom.example';

export interface UserRowProps {
  readonly name:       string;
  readonly email:      string;
  readonly status:     'online' | 'offline' | 'busy';
  readonly onSelect?:  () => void;
  readonly className?: string;
}

export function UserRow({ name, email, status, onSelect, className = '' }: UserRowProps) {
  const isClickable = Boolean(onSelect);

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={isClickable ? (e) => e.key === 'Enter' && onSelect?.() : undefined}
      className={[
        'flex items-center gap-sm p-sm rounded-lg',
        isClickable ? 'cursor-pointer hover:bg-surface-high' : '',
        className,
      ].join(' ')}
    >
      <StatusDot status={status} />
      <div className="flex flex-col min-w-0">
        <span className="text-body-md-medium text-text-primary truncate">{name}</span>
        <span className="text-label-md text-text-secondary truncate">{email}</span>
      </div>
    </div>
  );
}

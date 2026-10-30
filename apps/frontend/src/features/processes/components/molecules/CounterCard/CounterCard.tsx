import { Link } from 'react-router-dom';
import { Icon } from '@shared/components/atoms/Icon';

export interface CounterCardProps {
  readonly label: string;
  readonly value: number;
  readonly to: string;
  readonly icon: string;
}

export function CounterCard({ label, value, to, icon }: CounterCardProps): JSX.Element {
  return (
    <Link
      to={to}
      aria-label={`${label}: ${value}`}
      className="row-interactive bg-surface-card border border-surface-high rounded-xl shadow-raised p-base flex flex-col gap-sm"
    >
      <span className="flex items-center gap-xs text-body-md-medium text-text-secondary">
        <Icon name={icon} size={18} className="text-primary-interactive" />
        {label}
      </span>
      <span className="text-display-xl text-text-primary">{value}</span>
    </Link>
  );
}

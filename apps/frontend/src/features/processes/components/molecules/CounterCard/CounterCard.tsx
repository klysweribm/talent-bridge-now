import { Link } from 'react-router-dom';
import { Icon } from '@shared/components/atoms/Icon';

export interface CounterCardProps {
  readonly label: string;
  readonly value: number | string;
  readonly to: string;
  readonly icon: string;
  readonly hint?: string;
}

export function CounterCard({ label, value, to, icon, hint }: CounterCardProps): JSX.Element {
  return (
    <Link
      to={to}
      aria-label={`${label}: ${value}`}
      className="bg-white px-base pt-base pb-5 min-h-[136px] flex flex-col gap-lg hover:bg-carbon-gray-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-carbon-blue-60"
    >
      <span className="flex items-center justify-between gap-sm text-body text-carbon-gray-70">
        {label}
        <Icon name={icon} size={20} className="text-carbon-blue-60" />
      </span>
      <span className="text-kpi text-carbon-gray-100">{value}</span>
      {hint && <span className="text-label text-carbon-gray-70 -mt-md">{hint}</span>}
    </Link>
  );
}

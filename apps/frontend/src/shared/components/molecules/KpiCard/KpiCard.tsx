export interface KpiCardProps {
  readonly label:      string;
  readonly value:      string | number;
  readonly icon?:      string;
  readonly trend?:     'up' | 'down' | 'neutral';
  readonly trendLabel?: string;
  readonly className?: string;
}

const TREND_STYLES = {
  up:      { icon: 'trending_up',   color: 'text-status-success' },
  down:    { icon: 'trending_down', color: 'text-status-danger' },
  neutral: { icon: 'trending_flat', color: 'text-text-secondary' },
} as const;

interface IKpiTrendProps {
  readonly trend?:      'up' | 'down' | 'neutral';
  readonly trendLabel?: string;
}

function KpiTrend({ trend, trendLabel }: IKpiTrendProps): JSX.Element | null {
  const trendConfig = trend ? TREND_STYLES[trend] : null;
  if (!trendConfig || !trendLabel) return null;

  return (
    <div className={`flex items-center gap-2xs text-label-md ${trendConfig.color}`}>
      <span aria-hidden="true" className="material-symbols-outlined text-[14px]">
        {trendConfig.icon}
      </span>
      <span>{trendLabel}</span>
    </div>
  );
}

export function KpiCard({
  label,
  value,
  icon,
  trend,
  trendLabel,
  className = '',
}: KpiCardProps): JSX.Element {
  return (
    <article
      aria-label={`${label}: ${value}`}
      className={['bg-surface-card border border-[#e0e0e0] rounded-lg p-base', 'flex flex-col gap-xs', className].join(' ')}
    >
      <div className="flex items-center justify-between">
        <span className="text-label-md text-text-secondary uppercase tracking-wide">
          {label}
        </span>
        {icon && (
          <span aria-hidden="true" className="material-symbols-outlined text-[20px] text-primary-container">
            {icon}
          </span>
        )}
      </div>

      <span className="text-headline-sm font-semibold text-text-primary">
        {value}
      </span>

      <KpiTrend trend={trend} trendLabel={trendLabel} />
    </article>
  );
}

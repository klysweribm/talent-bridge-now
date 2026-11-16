export interface KpiCardProps {
  readonly label:      string;
  readonly value:      string | number;
  readonly icon?:      string;
  readonly trend?:     'up' | 'down' | 'neutral';
  readonly trendLabel?: string;
  readonly className?: string;
}

const TREND_STYLES = {
  up:      { icon: 'trending_up',   color: 'text-carbon-green' },
  down:    { icon: 'trending_down', color: 'text-carbon-red' },
  neutral: { icon: 'trending_flat', color: 'text-carbon-gray-70' },
} as const;

interface IKpiTrendProps {
  readonly trend?:      'up' | 'down' | 'neutral';
  readonly trendLabel?: string;
}

function KpiTrend({ trend, trendLabel }: IKpiTrendProps): JSX.Element | null {
  const trendConfig = trend ? TREND_STYLES[trend] : null;
  if (!trendConfig || !trendLabel) return null;

  return (
    <div className={`flex items-center gap-2xs text-label ${trendConfig.color}`}>
      <span aria-hidden="true" className="material-symbols-outlined text-[14px]">
        {trendConfig.icon}
      </span>
      <span>{trendLabel}</span>
    </div>
  );
}

/** Celda de KPI del prototipo: blanca, sin radio ni sombra; se compone dentro de `KpiStrip`. */
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
      className={['bg-white px-base pt-base pb-5 min-h-[136px] flex flex-col gap-lg', className].join(' ')}
    >
      <div className="flex items-center justify-between">
        <span className="text-body text-carbon-gray-70">{label}</span>
        {icon && (
          <span aria-hidden="true" className="material-symbols-outlined text-[20px] text-carbon-blue-60">
            {icon}
          </span>
        )}
      </div>

      <span className="text-kpi text-carbon-gray-100">{value}</span>

      <KpiTrend trend={trend} trendLabel={trendLabel} />
    </article>
  );
}

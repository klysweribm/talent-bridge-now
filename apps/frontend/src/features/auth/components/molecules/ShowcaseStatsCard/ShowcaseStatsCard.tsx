import { LOGIN_SHOWCASE } from '@features/auth/config/loginShowcase';

/** Tarjeta decorativa de estadísticas (cifras ilustrativas de maqueta, no datos reales). */
export function ShowcaseStatsCard(): JSX.Element {
  return (
    <div className="flex divide-x divide-white/20 rounded-xl bg-white/10 border border-white/20 p-md max-w-md">
      {LOGIN_SHOWCASE.stats.map(stat => (
        <div key={stat.caption} className="flex flex-col gap-2xs px-md first:pl-0 last:pr-0">
          <span className="flex items-baseline gap-sm">
            <span className="text-headline-md text-white">{stat.value}</span>
            {stat.delta && <span className="text-label-md text-status-success-bg">{stat.delta}</span>}
          </span>
          <span className="text-label-md text-primary-fixed-dim">{stat.caption}</span>
        </div>
      ))}
    </div>
  );
}

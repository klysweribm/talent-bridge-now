import { LOGIN_SHOWCASE } from '@features/auth/config/loginShowcase';
import { ShowcaseProfileCard } from '@features/auth/components/molecules/ShowcaseProfileCard/ShowcaseProfileCard';
import { ShowcaseStatsCard } from '@features/auth/components/molecules/ShowcaseStatsCard/ShowcaseStatsCard';

/**
 * Panel izquierdo del login: puramente decorativo (aria-hidden, sin headings ni
 * alerts). El titular es un párrafo para no añadir jerarquía ni duplicar la marca.
 */
export function LoginShowcasePanel(): JSX.Element {
  const s = LOGIN_SHOWCASE;
  return (
    <aside
      data-testid="login-showcase"
      aria-hidden="true"
      className="hidden lg:flex flex-col justify-between gap-xl p-2xl text-white bg-gradient-to-br from-brand-deep via-brand-mid to-primary"
    >
      <div className="flex items-center justify-between">
        <span className="text-label tracking-widest">{s.label}</span>
        <span className="flex items-center gap-sm rounded-pill bg-white/10 border border-white/20 px-md py-xs text-label">
          <span className="w-2 h-2 rounded-full bg-carbon-green" />
          {s.cloudPill}
        </span>
      </div>

      <div className="flex flex-col gap-lg">
        <span className="text-label uppercase tracking-widest text-primary-fixed-dim">{s.eyebrow}</span>
        <p className="m-0 text-h1 max-w-xl">
          {s.headlineLead} <span className="text-primary-fixed-dim">{s.headlineEm}</span>
        </p>
        <ShowcaseProfileCard />
        <ShowcaseStatsCard />
      </div>

      <div className="flex items-center justify-between gap-md text-label text-primary-fixed-dim">
        <span>{s.poweredBy}</span>
        <span>{s.guard}</span>
      </div>
    </aside>
  );
}

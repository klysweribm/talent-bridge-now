import { LOGIN_SHOWCASE } from '@features/auth/config/loginShowcase';

/** Tarjeta decorativa de perfil (contenido ilustrativo de maqueta). */
export function ShowcaseProfileCard(): JSX.Element {
  const { profile } = LOGIN_SHOWCASE;
  return (
    <div className="flex items-center gap-md rounded-xl bg-white/10 border border-white/20 p-md max-w-xs">
      <span className="relative flex items-center justify-center w-12 h-12 rounded-full bg-primary-interactive text-white text-title-md">
        {profile.initials}
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-status-success border-2 border-brand-mid" />
      </span>
      <div className="flex flex-col gap-2xs">
        <span className="text-title-md text-white">{profile.name}</span>
        <span className="text-body-md text-primary-fixed-dim">{profile.role}</span>
        <span className="self-start text-label-sm tracking-wide rounded bg-white/15 text-white px-sm py-2xs">
          {profile.badge}
        </span>
      </div>
    </div>
  );
}

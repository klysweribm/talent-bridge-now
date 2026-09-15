import { Icon } from '@shared/components/atoms/Icon';

export function ProfileDetectionBanner() {
  return (
    <section className="flex items-start gap-sm bg-surface-low rounded-lg p-md">
      <Icon name="psychology" size={20} className="flex-shrink-0 text-primary-interactive mt-2xs" />
      <div className="flex flex-col">
        <span className="text-label-md text-text-primary">
          Detección automática de perfil
        </span>
        <p className="text-label-sm text-text-secondary mt-2xs mb-0">
          Reclutador, Referente Técnico o PM según los permisos registrados en tu cuenta corporativa IBM.
        </p>
      </div>
    </section>
  );
}

import { Icon } from '@shared/components/atoms/Icon/Icon';

export interface SkillChipProps {
  readonly label:        string;
  /** Si se pasa, el chip muestra un botón × que lo quita (modo edición); sin él es solo lectura. */
  readonly onRemove?:    () => void;
  readonly removeLabel?: string;
  readonly disabled?:    boolean;
}

export function SkillChip({ label, onRemove, removeLabel, disabled = false }: SkillChipProps): JSX.Element {
  return (
    <span className="inline-flex items-center gap-xs min-h-6 px-sm rounded-full bg-surface-base text-label-md font-medium text-text-primary">
      {label}
      {onRemove && (
        <button
          type="button" onClick={onRemove} disabled={disabled} aria-label={removeLabel ?? label}
          className="inline-flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-primary-interactive disabled:opacity-50"
        >
          <Icon name="close" size={14} />
        </button>
      )}
    </span>
  );
}

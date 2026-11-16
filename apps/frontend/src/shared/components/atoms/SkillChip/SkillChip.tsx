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
    <span className={`inline-flex items-center gap-xs h-6 rounded-pill bg-carbon-blue-20 text-label text-carbon-blue-80 ${onRemove ? 'pl-sm pr-xs' : 'px-sm'}`}>
      {label}
      {onRemove && (
        <button
          type="button" onClick={onRemove} disabled={disabled} aria-label={removeLabel ?? label}
          className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full text-carbon-blue-80 hover:bg-carbon-blue-30 focus-visible:outline-2 focus-visible:outline-carbon-blue-60 disabled:opacity-50"
        >
          <Icon name="close" size={14} />
        </button>
      )}
    </span>
  );
}

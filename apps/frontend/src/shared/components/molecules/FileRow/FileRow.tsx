import { Icon } from '@shared/components/atoms/Icon';

export interface FileRowProps {
  readonly name:        string;
  /** Tamaño ya formateado (p. ej. "1,2 MB"). */
  readonly sizeLabel?:  string;
  readonly removeLabel: string;
  readonly onRemove:    () => void;
}

/** Fila de archivo seleccionado del prototipo: 48px, nombre elipsado, tamaño 12px y × de 48px. */
export function FileRow({ name, sizeLabel, removeLabel, onRemove }: FileRowProps): JSX.Element {
  return (
    <div className="flex h-12 items-center gap-sm bg-carbon-gray-10 pl-base text-body">
      <span title={name} className="min-w-0 flex-1 truncate text-carbon-gray-100">{name}</span>
      {sizeLabel && <span className="text-label text-carbon-gray-70">{sizeLabel}</span>}
      <button
        type="button" aria-label={removeLabel} onClick={onRemove}
        className="flex h-12 w-12 items-center justify-center hover:bg-carbon-gray-hover focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-carbon-blue-60"
      >
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}

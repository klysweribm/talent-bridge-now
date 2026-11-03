import { useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import { Icon } from '@shared/components/atoms/Icon/Icon';
import { CV_ACCEPT_ATTRIBUTE, CV_MAX_FILE_BYTES } from '../../../config/candidates.constants';
import { CV_DROPZONE_COPY } from '../../../config/candidates.copy';
import { formatSizeLimit } from '../../../utils/formatFileSize';

export interface CvDropzoneProps {
  readonly error: string | null;
  /** Recibe el archivo elegido o soltado; la validación (tipo/tamaño) es del llamador. */
  readonly onSelect: (file: File | undefined) => void;
  readonly disabled?: boolean;
}

type TZoneState = 'idle' | 'dragging' | 'error';

const ZONE_STYLE: Readonly<Record<TZoneState, string>> = {
  idle: 'border-outline-field bg-surface-card hover:bg-surface-low',
  dragging: 'border-primary-interactive bg-status-info-bg',
  error: 'border-status-danger bg-status-danger-bg',
};

function Prompt(): JSX.Element {
  return (
    <>
      <Icon name="upload_file" size={32} className="text-primary-interactive" />
      <span id="cv-file-prompt" className="text-body-md-medium text-text-primary">{CV_DROPZONE_COPY.prompt}</span>
      <span id="cv-file-limit" className="text-label-md text-text-secondary">
        {CV_DROPZONE_COPY.supported(formatSizeLimit(CV_MAX_FILE_BYTES))}
      </span>
    </>
  );
}

/** Arrastrar/soltar y teclado de la zona; la validación del archivo es del llamador. */
interface IZoneHandlers {
  readonly dragging: boolean;
  readonly onClick: () => void;
  readonly onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  readonly onDragEnter: (event: DragEvent<HTMLDivElement>) => void;
  readonly onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  readonly onDragLeave: () => void;
  readonly onDrop: (event: DragEvent<HTMLDivElement>) => void;
}

function useZoneHandlers(onSelect: CvDropzoneProps['onSelect'], disabled: boolean, open: () => void): IZoneHandlers {
  const [dragging, setDragging] = useState(false);
  return {
    dragging,
    onClick: open,
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>): void => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); }
    },
    onDragEnter: (event: DragEvent<HTMLDivElement>): void => { event.preventDefault(); if (!disabled) setDragging(true); },
    onDragOver: (event: DragEvent<HTMLDivElement>): void => event.preventDefault(),
    onDragLeave: (): void => setDragging(false),
    onDrop: (event: DragEvent<HTMLDivElement>): void => {
      event.preventDefault();
      setDragging(false);
      if (!disabled) onSelect(event.dataTransfer.files[0]);
    },
  };
}

export function CvDropzone({ error, onSelect, disabled = false }: CvDropzoneProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const open = (): void => { if (!disabled) inputRef.current?.click(); };
  const { dragging, ...handlers } = useZoneHandlers(onSelect, disabled, open);
  const state: TZoneState = error ? 'error' : dragging ? 'dragging' : 'idle';
  const describedBy = ['cv-file-limit', error ? 'cv-file-error' : null].filter(Boolean).join(' ');

  return (
    <div className="flex flex-col gap-xs">
      <label htmlFor="cv-file" className="sr-only">{CV_DROPZONE_COPY.fileLabel}</label>
      <input
        ref={inputRef} id="cv-file" type="file" accept={CV_ACCEPT_ATTRIBUTE} disabled={disabled} tabIndex={-1}
        aria-invalid={error ? true : undefined} aria-describedby={describedBy}
        onChange={event => onSelect(event.target.files?.[0])} className="sr-only"
      />
      <div
        data-testid="cv-dropzone" data-state={state} role="button" tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined} aria-labelledby="cv-file-prompt" aria-describedby={describedBy}
        {...handlers}
        className={`flex min-h-11 flex-col items-center justify-center gap-xs rounded border-2 border-dashed p-lg text-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-interactive aria-disabled:cursor-not-allowed aria-disabled:opacity-50 ${ZONE_STYLE[state]}`}
      >
        <Prompt />
      </div>
      {error && <p id="cv-file-error" role="alert" className="text-label-md text-status-danger">{error}</p>}
    </div>
  );
}

import { useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import { Icon } from '@shared/components/atoms/Icon/Icon';
import { ZONE_BASE_CLASSES, ZONE_STYLE, type TZoneState } from './fileDropzone.constants';

export interface FileDropzoneProps {
  /** Prefijo de los ids (`<prefijo>-file`, `-file-prompt`, `-file-limit`, `-file-error`). */
  readonly idPrefix: string;
  readonly testId: string;
  readonly label: string;
  readonly prompt: string;
  readonly supportedHint: string;
  readonly accept: string;
  readonly error: string | null;
  /** Recibe el archivo elegido o soltado; la validación (tipo/tamaño) es del llamador. */
  readonly onSelect: (file: File | undefined) => void;
  readonly disabled?: boolean;
}


function Prompt({ ids, prompt, supportedHint }: { readonly ids: IZoneIds; readonly prompt: string; readonly supportedHint: string }): JSX.Element {
  return (
    <>
      <Icon name="upload_file" size={24} className="text-carbon-blue-60" />
      <span id={ids.prompt} className="text-body text-carbon-blue-60">{prompt}</span>
      <span id={ids.limit} className="text-label text-carbon-gray-70">{supportedHint}</span>
    </>
  );
}

interface IZoneIds { readonly input: string; readonly prompt: string; readonly limit: string; readonly error: string }

function zoneIds(prefix: string): IZoneIds {
  return { input: `${prefix}-file`, prompt: `${prefix}-file-prompt`, limit: `${prefix}-file-limit`, error: `${prefix}-file-error` };
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

function useZoneHandlers(onSelect: FileDropzoneProps['onSelect'], disabled: boolean, open: () => void): IZoneHandlers {
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

export function FileDropzone(props: FileDropzoneProps): JSX.Element {
  const { idPrefix, testId, label, prompt, supportedHint, accept, error, onSelect, disabled = false } = props;
  const ids = zoneIds(idPrefix);
  const inputRef = useRef<HTMLInputElement>(null);
  const open = (): void => { if (!disabled) inputRef.current?.click(); };
  const { dragging, ...handlers } = useZoneHandlers(onSelect, disabled, open);
  const state: TZoneState = error ? 'error' : dragging ? 'dragging' : 'idle';
  const describedBy = [ids.limit, error ? ids.error : null].filter(Boolean).join(' ');

  return (
    <div className="flex flex-col gap-xs">
      <label htmlFor={ids.input} className="sr-only">{label}</label>
      <input
        ref={inputRef} id={ids.input} type="file" accept={accept} disabled={disabled} tabIndex={-1}
        aria-invalid={error ? true : undefined} aria-describedby={describedBy}
        onChange={event => onSelect(event.target.files?.[0])} className="sr-only"
      />
      <div
        data-testid={testId} data-state={state} role="button" tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined} aria-labelledby={ids.prompt} aria-describedby={describedBy}
        {...handlers}
        className={`${ZONE_BASE_CLASSES} ${ZONE_STYLE[state]}`}
      >
        <Prompt ids={ids} prompt={prompt} supportedHint={supportedHint} />
      </div>
      {error && <p id={ids.error} role="alert" className="text-label text-carbon-red">{error}</p>}
    </div>
  );
}

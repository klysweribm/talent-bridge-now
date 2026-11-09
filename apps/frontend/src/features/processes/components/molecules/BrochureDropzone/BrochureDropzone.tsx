import { FileDropzone } from '@shared/components/molecules/FileDropzone/FileDropzone';
import { formatSizeLimit } from '@shared/utils/formatFileSize';
import { DRAFT_COPY } from '../../../config/opportunityDraft.copy';
import { OPPORTUNITY_SOURCE_ACCEPT, OPPORTUNITY_SOURCE_MAX_FILE_BYTES } from '../../../config/opportunitySource.constants';

export interface BrochureDropzoneProps {
  /** Recibe el archivo elegido o soltado; la validación es del llamador. */
  readonly onSelect: (file: File | undefined) => void;
  readonly disabled: boolean;
}

const BROCHURE_ID_PREFIX = 'brochure';

/** Zona para subir un brochure; solo aporta copy y límites, la mecánica es de `FileDropzone`. Los errores los muestra el panel. */
export function BrochureDropzone({ onSelect, disabled }: BrochureDropzoneProps): JSX.Element {
  return (
    <FileDropzone
      idPrefix={BROCHURE_ID_PREFIX} testId="brochure-dropzone" label={DRAFT_COPY.brochure.fileLabel}
      prompt={DRAFT_COPY.brochure.prompt} supportedHint={DRAFT_COPY.brochure.supported(formatSizeLimit(OPPORTUNITY_SOURCE_MAX_FILE_BYTES))}
      accept={OPPORTUNITY_SOURCE_ACCEPT} error={null} onSelect={onSelect} disabled={disabled}
    />
  );
}

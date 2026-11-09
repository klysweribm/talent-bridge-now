import { FileDropzone } from '@shared/components/molecules/FileDropzone/FileDropzone';
import { formatSizeLimit } from '@shared/utils/formatFileSize';
import { CV_ACCEPT_ATTRIBUTE, CV_MAX_FILE_BYTES } from '../../../config/candidates.constants';
import { CV_DROPZONE_COPY } from '../../../config/candidates.copy';

export interface CvDropzoneProps {
  readonly error: string | null;
  /** Recibe el archivo elegido o soltado; la validación (tipo/tamaño) es del llamador. */
  readonly onSelect: (file: File | undefined) => void;
  readonly disabled?: boolean;
}

const CV_ID_PREFIX = 'cv';

/** Dropzone del CV: solo aporta su copy y sus límites; la mecánica vive en `FileDropzone`. */
export function CvDropzone({ error, onSelect, disabled = false }: CvDropzoneProps): JSX.Element {
  return (
    <FileDropzone
      idPrefix={CV_ID_PREFIX} testId="cv-dropzone" label={CV_DROPZONE_COPY.fileLabel} prompt={CV_DROPZONE_COPY.prompt}
      supportedHint={CV_DROPZONE_COPY.supported(formatSizeLimit(CV_MAX_FILE_BYTES))} accept={CV_ACCEPT_ATTRIBUTE}
      error={error} onSelect={onSelect} disabled={disabled}
    />
  );
}

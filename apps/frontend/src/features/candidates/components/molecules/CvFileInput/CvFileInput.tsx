import { CV_ACCEPT_ATTRIBUTE, CV_MAX_FILE_BYTES } from '../../../config/candidates.constants';
import { formatFileSize, formatSizeLimit } from '../../../utils/formatFileSize';

export interface CvFileInputProps {
  readonly file?: File;
  readonly error: string | null;
  readonly onSelect: (file: File | undefined) => void;
  readonly disabled?: boolean;
}

export function CvFileInput({ file, error, onSelect, disabled = false }: CvFileInputProps): JSX.Element {
  return (
    <div className="flex flex-col gap-2xs">
      <label htmlFor="cv-file" className="text-body-md-medium text-text-primary">Archivo del CV (PDF o DOCX)</label>
      <input
        id="cv-file"
        type="file"
        accept={CV_ACCEPT_ATTRIBUTE}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby="cv-file-limit"
        onChange={event => onSelect(event.target.files?.[0])}
        className="text-body-md text-text-primary"
      />
      <span id="cv-file-limit" className="text-label-md text-text-secondary">
        Máximo {formatSizeLimit(CV_MAX_FILE_BYTES)} · PDF o DOCX
      </span>
      {file && !error && (
        <span className="text-label-md text-text-secondary">Seleccionado: {file.name} ({formatFileSize(file.size)})</span>
      )}
      {error && <p role="alert" className="text-label-md text-status-danger">{error}</p>}
    </div>
  );
}

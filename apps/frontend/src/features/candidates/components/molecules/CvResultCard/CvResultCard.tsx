import type { ICvExtractionResult } from '@ibm-talent-bridge/shared-types';
import { Icon } from '@shared/components/atoms/Icon/Icon';
import { SkillChip } from '@shared/components/atoms/SkillChip/SkillChip';
import { CV_RESULT_COPY } from '../../../config/candidates.copy';
import { formatFileSize } from '../../../utils/formatFileSize';

export interface CvResultCardProps {
  readonly file: File;
  /** Sin resultado la tarjeta solo confirma el archivo elegido. */
  readonly result?: ICvExtractionResult;
  /** Sin esta función no se muestra la papelera (p. ej. ya en la revisión). */
  readonly onRemove?: () => void;
}

function Keywords({ result }: { readonly result: ICvExtractionResult }): JSX.Element | null {
  const skills = result.draft.skills ?? [];
  if (skills.length === 0) return null;
  return (
    <div className="flex flex-col gap-xs">
      <p className="text-label-md font-medium text-text-secondary">{CV_RESULT_COPY.keywords(result.extractor)}</p>
      <ul className="flex flex-wrap gap-xs">
        {skills.map(skill => <li key={skill.name}><SkillChip label={skill.name} /></li>)}
      </ul>
    </div>
  );
}

export function CvResultCard({ file, result, onRemove }: CvResultCardProps): JSX.Element {
  return (
    <div className="flex flex-col gap-sm rounded border border-outline-variant bg-surface-card p-base">
      <div className="flex items-center gap-sm">
        <Icon name={result ? 'check_circle' : 'description'} size={24} className={result ? 'text-status-success' : 'text-text-secondary'} />
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="text-body-md-medium text-text-primary">{result ? CV_RESULT_COPY.analyzed : CV_RESULT_COPY.selected}</p>
          <p className="truncate text-label-md text-text-secondary">
            <span>{file.name}</span> · <span>{formatFileSize(file.size)}</span>
          </p>
        </div>
        {onRemove && (
          <button
            type="button" onClick={onRemove} aria-label={CV_RESULT_COPY.remove}
            className="inline-flex size-11 items-center justify-center rounded text-text-secondary hover:bg-surface-low hover:text-text-primary focus-visible:outline-2 focus-visible:outline-primary-interactive"
          >
            <Icon name="delete" size={20} />
          </button>
        )}
      </div>
      {result && <Keywords result={result} />}
    </div>
  );
}

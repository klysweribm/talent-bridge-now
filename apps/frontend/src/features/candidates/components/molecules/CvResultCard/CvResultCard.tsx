import type { ICvExtractionResult } from '@ibm-talent-bridge/shared-types';
import { Icon } from '@shared/components/atoms/Icon/Icon';
import { SkillChip } from '@shared/components/atoms/SkillChip/SkillChip';
import { CV_RESULT_COPY } from '../../../config/candidates.copy';
import { formatFileSize } from '@shared/utils/formatFileSize';

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
      <p className="text-label text-carbon-gray-70">{CV_RESULT_COPY.keywords(result.extractor)}</p>
      <ul className="flex flex-wrap gap-xs">
        {skills.map(skill => <li key={skill.name}><SkillChip label={skill.name} /></li>)}
      </ul>
    </div>
  );
}

export function CvResultCard({ file, result, onRemove }: CvResultCardProps): JSX.Element {
  return (
    <div className="flex flex-col gap-sm bg-white p-base">
      <div className="flex items-center gap-sm">
        <Icon name={result ? 'check_circle' : 'description'} size={24} className={result ? 'text-carbon-green' : 'text-carbon-gray-70'} />
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="font-semibold text-body text-carbon-gray-100">{result ? CV_RESULT_COPY.analyzed : CV_RESULT_COPY.selected}</p>
          <p className="truncate text-label text-carbon-gray-70">
            <span>{file.name}</span> · <span>{formatFileSize(file.size)}</span>
          </p>
        </div>
        {onRemove && (
          <button
            type="button" onClick={onRemove} aria-label={CV_RESULT_COPY.remove}
            className="inline-flex size-11 items-center justify-center rounded-none text-carbon-gray-70 hover:bg-carbon-gray-hover hover:text-carbon-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-carbon-blue-60"
          >
            <Icon name="delete" size={20} />
          </button>
        )}
      </div>
      {result && <Keywords result={result} />}
    </div>
  );
}

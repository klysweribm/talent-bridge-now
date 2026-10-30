import type { IBenchResource } from '@ibm-talent-bridge/shared-types';
import { formatAvailability } from '../../../utils/formatAvailability';
import { topSkills } from '../../../utils/topSkills';
import { BenchStatusBadge } from '../../atoms/BenchStatusBadge';
import { SeniorityBadge } from '../../atoms/SeniorityBadge';
import { SkillChips } from '../SkillChips';

export interface BenchTableRowProps {
  readonly resource: IBenchResource;
  readonly onSelect: (benchCode: string) => void;
}

const CELL = 'px-base align-middle';

/** El botón del código es la vía de teclado; el clic en la fila (burbujeo) cubre el mouse. */
export function BenchTableRow({ resource, onSelect }: BenchTableRowProps): JSX.Element {
  return (
    <tr
      className="h-14 border-b border-outline-variant hover:bg-surface cursor-pointer"
      onClick={() => onSelect(resource.benchCode)}
    >
      <td className={CELL}>
        <button
          type="button"
          data-resource-code={resource.benchCode}
          aria-label={`Ver detalle de ${resource.benchCode} ${resource.displayName}`}
          className="text-body-md-medium text-primary-interactive hover:underline"
        >
          {resource.benchCode}
        </button>
      </td>
      <td className={`${CELL} text-body-md text-text-primary`}>{resource.displayName}</td>
      <td className={`${CELL} text-body-md text-text-secondary`}>{resource.primaryRole}</td>
      <td className={CELL}><SeniorityBadge seniority={resource.seniority} /></td>
      <td className={CELL}><SkillChips skills={topSkills(resource.skills)} /></td>
      <td className={`${CELL} text-body-md text-text-secondary`}>{resource.location.country}</td>
      <td className={`${CELL} text-body-md text-text-secondary`}>{formatAvailability(resource.availableFrom)}</td>
      <td className={CELL}><BenchStatusBadge status={resource.status} /></td>
    </tr>
  );
}

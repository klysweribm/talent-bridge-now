import type { IBenchResource } from '@ibm-talent-bridge/shared-types';
import { TABLE_CELL, TABLE_CODE, TABLE_DATE, TABLE_ROW, TABLE_ROW_SELECTED } from '@shared/components/table.constants';
import { formatAvailability } from '../../../utils/formatAvailability';
import { topSkills } from '../../../utils/topSkills';
import { BenchStatusBadge } from '../../atoms/BenchStatusBadge';
import { SeniorityBadge } from '../../atoms/SeniorityBadge';
import { SkillChips } from '../SkillChips';

export interface BenchTableRowProps {
  readonly resource: IBenchResource;
  readonly selected?: boolean;
  readonly onSelect: (benchCode: string) => void;
}

const CELL = `${TABLE_CELL} align-middle`;
const MUTED = `${CELL} text-carbon-gray-70`;

/** El botón del código es la vía de teclado; el clic en la fila (burbujeo) cubre el mouse. */
export function BenchTableRow({ resource, selected = false, onSelect }: BenchTableRowProps): JSX.Element {
  return (
    <tr
      className={`${selected ? TABLE_ROW_SELECTED : TABLE_ROW} cursor-pointer`}
      onClick={() => onSelect(resource.benchCode)}
    >
      <td className={CELL}>
        <button
          type="button"
          data-resource-code={resource.benchCode}
          aria-label={`Ver detalle de ${resource.benchCode} ${resource.displayName}`}
          className={`${TABLE_CODE} hover:underline`}
        >
          {resource.benchCode}
        </button>
      </td>
      <td className={`${CELL} font-semibold`}>{resource.displayName}</td>
      <td className={MUTED}>{resource.primaryRole}</td>
      <td className={CELL}><SeniorityBadge seniority={resource.seniority} /></td>
      <td className={CELL}><SkillChips skills={topSkills(resource.skills)} /></td>
      <td className={MUTED}>{resource.location.country}</td>
      <td className={`${CELL} ${TABLE_DATE}`}>{formatAvailability(resource.availableFrom)}</td>
      <td className={CELL}><BenchStatusBadge status={resource.status} /></td>
    </tr>
  );
}

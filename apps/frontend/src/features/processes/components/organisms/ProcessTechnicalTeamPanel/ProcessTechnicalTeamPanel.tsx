import type { IProcessDetail } from '@ibm-talent-bridge/shared-types';
import { Button } from '@shared/components/atoms/Button';
import { TECHNICAL_TEAM_COPY as COPY } from '../../../config/technicalTeam.copy';
import { TECHNICAL_REFS_MAX } from '../../../config/technicalTeam.constants';
import { useTechnicalTeamEditor } from '../../../hooks/useTechnicalTeamEditor';
import { ActionFeedback } from '../../molecules/ActionFeedback/ActionFeedback';
import { TechnicalRefPicker } from '../../molecules/TechnicalRefPicker/TechnicalRefPicker';
import { TechnicalTeamCard } from '../../molecules/TechnicalTeamCard/TechnicalTeamCard';

export interface ProcessTechnicalTeamPanelProps {
  readonly process: IProcessDetail;
  /** Sin permiso (o proceso terminal) la tarjeta es de solo lectura y no se consulta a los referentes. */
  readonly canEdit: boolean;
}

/** Equipo técnico del proceso: tarjeta presentacional + asignación (reemplazo del conjunto) para quien puede editar. */
export function ProcessTechnicalTeamPanel({ process, canEdit }: ProcessTechnicalTeamPanelProps): JSX.Element {
  const editor = useTechnicalTeamEditor(process);
  const manage = canEdit && (
    <Button type="button" variant="secondary" className="min-h-11 self-start" aria-expanded={editor.open} onClick={editor.toggleOpen}>
      {editor.open ? COPY.closeManage : COPY.manage}
    </Button>
  );
  return (
    <div className="flex flex-col gap-md">
      <TechnicalTeamCard refs={process.technicalRefs} maxRefs={TECHNICAL_REFS_MAX} actions={manage || undefined} />
      {canEdit && editor.open && (
        <TechnicalRefPicker status={editor.status} options={editor.options} selected={editor.selected} max={TECHNICAL_REFS_MAX}
          saving={editor.saving} onToggle={editor.onToggle} onRetry={editor.onRetry} onSave={editor.onSave} onCancel={editor.onCancel} />
      )}
      {canEdit && <ActionFeedback error={editor.error} success={editor.saved ? COPY.picker.saved : undefined} />}
    </div>
  );
}

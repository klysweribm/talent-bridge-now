import { useState } from 'react';
import type { IProcessDetail } from '@ibm-talent-bridge/shared-types';
import { TECHNICAL_REF_ROLE } from '../config/technicalTeam.constants';
import { buildTechnicalRefOptions, sameIdSet, toggleTechnicalRef, type ITechnicalRefOption } from '../utils/technicalRefOptions';
import { useUpdateProcess } from './useUpdateProcess';
import { useProcessLimits } from './useProcessLimits';
import { useUserOptions } from './useUserOptions';

export interface IUseTechnicalTeamEditor {
  readonly open:     boolean;
  readonly toggleOpen: () => void;
  readonly status:   'loading' | 'error' | 'empty' | 'ready';
  readonly options:  readonly ITechnicalRefOption[];
  readonly selected: readonly string[];
  readonly onToggle: (id: string) => void;
  readonly onRetry:  () => void;
  readonly onSave:   () => void;
  readonly onCancel: () => void;
  readonly saving:   boolean;
  readonly error?:   string;
  readonly saved:    boolean;
  /** Tope de referentes del servidor; `undefined` mientras no llega (o sin acceso a los límites). */
  readonly max:      number | undefined;
}

/** Borrador de selección (estado de UI) + opciones (React Query) + guardado (mutación). Solo consulta con el selector abierto. */
export function useTechnicalTeamEditor(process: IProcessDetail): IUseTechnicalTeamEditor {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<readonly string[]>(process.technicalRefIds);
  const available = useUserOptions(TECHNICAL_REF_ROLE, open);
  const update = useUpdateProcess(process.id);
  const max = useProcessLimits().data?.technicalRefsMax;
  const options = buildTechnicalRefOptions(process.technicalRefs, available.data?.data ?? []);
  let status: IUseTechnicalTeamEditor['status'] = options.length === 0 ? 'empty' : 'ready';
  if (available.isError) status = 'error';
  else if (available.isPending && options.length === 0) status = 'loading';
  const close = (): void => { setOpen(false); update.reset(); };
  return {
    open, status, options, selected, saving: update.isPending, error: update.error?.message, saved: update.isSuccess && !open, max,
    toggleOpen: () => { if (open) close(); else { update.reset(); setSelected(process.technicalRefIds); setOpen(true); } },
    onToggle: id => { if (max === undefined) return; update.reset(); setSelected(current => toggleTechnicalRef(current, id, max)); },
    onRetry: () => void available.refetch(),
    onSave: () => {
      if (sameIdSet(selected, process.technicalRefIds)) { close(); return; }
      update.mutate({ technicalRefIds: selected }, { onSuccess: () => setOpen(false) });
    },
    onCancel: close,
  };
}

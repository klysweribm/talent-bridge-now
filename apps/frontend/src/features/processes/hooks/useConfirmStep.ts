import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@features/auth/store/auth.store';
import { PROCESSES_PATH } from '@/router/paths';
import { WIZARD_TEXT } from '../config/processWizard.constants';
import { ProcessServiceUnavailableError } from '../infrastructure/processCreate.errors';
import { useWizardStore } from '../store/wizard.store';
import { buildCreateProcessRequest } from '../utils/buildCreateProcessRequest';
import { useCreateProcess } from './useCreateProcess';
import { useUserOptions } from './useUserOptions';

export interface IUseConfirmStep {
  readonly isRecruiter: boolean;
  readonly userName:    string;
  readonly busy:        boolean;
  /** Mensaje del último error del servidor, si lo hay. */
  readonly errorMessage: string | null;
  readonly canRetry:    boolean;
  readonly submit:      () => void;
  readonly discard:     () => void;
}

export function useConfirmStep(): IUseConfirmStep {
  const navigate = useNavigate();
  const isRecruiter = useAuthStore(state => state.user?.role) === 'recruiter';
  const { data, candidates, reset } = useWizardStore();
  const users = useUserOptions(isRecruiter ? 'pm' : 'recruiter');
  const mutation = useCreateProcess();
  const selectedId = isRecruiter ? data.ownerPmId : data.recruiterId;
  const found = users.data?.data.find(user => user.id === selectedId)?.fullName;

  return {
    isRecruiter,
    userName: found ?? (selectedId || WIZARD_TEXT.unassigned),
    busy: mutation.isPending,
    errorMessage: mutation.isError ? mutation.error.message : null,
    canRetry: mutation.error instanceof ProcessServiceUnavailableError,
    submit: () => mutation.mutate(buildCreateProcessRequest({ data, candidates }, isRecruiter ? 'recruiter' : 'pm'), {
      onSuccess: created => { reset(); navigate(`${PROCESSES_PATH}/${created.id}`); },
    }),
    discard: () => { reset(); navigate(PROCESSES_PATH); },
  };
}

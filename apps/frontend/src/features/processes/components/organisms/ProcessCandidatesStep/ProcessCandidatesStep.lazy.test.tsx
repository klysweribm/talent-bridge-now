import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuthStore } from '@features/auth/store/auth.store';
import * as infra from '../../../infrastructure/processCreate.infra';
import { useWizardStore } from '../../../store/wizard.store';
import { makeCandidate, makePage, mockProcessLimits, renderAt } from '../../../test-utils';
import { ProcessCandidatesStep } from './ProcessCandidatesStep';

// Contador plano: vi.resetAllMocks no lo toca y se lee tal cual desde la carga del archivo.
const formModule = vi.hoisted(() => ({ evaluations: 0 }));

vi.mock('../../../infrastructure/processCreate.infra');
vi.mock('@features/candidates/components/organisms/CandidateCreateForm/CandidateCreateForm', () => {
  formModule.evaluations += 1;
  return { CandidateCreateForm: () => <p>formulario cargado</p> };
});

describe('ProcessCandidatesStep lazy form', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useWizardStore.getState().reset();
    useAuthStore.getState().setAuth({ id: 'me', email: 'm@ibm.com', role: 'pm', name: 'Yo' }, 't');
    mockProcessLimits({ maxCandidates: 5 });
    vi.mocked(infra.fetchAvailableCandidates).mockResolvedValue(makePage([makeCandidate(1)]));
  });
  afterEach(() => useAuthStore.getState().clearAuth());

  it('should not load the candidate form while the panel stays closed', async () => {
    renderAt(<ProcessCandidatesStep />, '/wizard');
    await screen.findByRole('checkbox', { name: 'Candidato 1 · Rol 1' });
    expect(formModule.evaluations).toBe(0);
  });

  it('should load the candidate form once the panel opens, behind an accessible loading state', async () => {
    renderAt(<ProcessCandidatesStep />, '/wizard');
    await userEvent.click(await screen.findByRole('button', { name: '+ Agregar candidato' }));
    expect(await screen.findByText('formulario cargado')).toBeInTheDocument();
    expect(formModule.evaluations).toBe(1);
  });
});

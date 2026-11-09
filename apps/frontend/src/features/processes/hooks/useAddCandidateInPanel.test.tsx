import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { AVAILABLE_CANDIDATES_QUERY_KEY } from '../config/processCreate.constants';
import { useWizardStore } from '../store/wizard.store';
import { CREATED_CANDIDATE } from '../panel-test-utils';
import { useAddCandidateInPanel } from './useAddCandidateInPanel';

function setup(max: number | undefined): { client: QueryClient; result: { current: ReturnType<typeof useAddCandidateInPanel> } } {
  const client = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }): JSX.Element => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  const { result } = renderHook(() => useAddCandidateInPanel(max), { wrapper });
  return { client, result };
}

describe('useAddCandidateInPanel', () => {
  beforeEach(() => useWizardStore.getState().reset());

  it('should invalidate, preselect, notify and close even though no panel is mounted', () => {
    const { client, result } = setup(5);
    const spy = vi.spyOn(client, 'invalidateQueries');
    act(() => result.current.openPanel());
    act(() => result.current.onSuccess(CREATED_CANDIDATE));
    expect(spy).toHaveBeenCalledWith({ queryKey: [AVAILABLE_CANDIDATES_QUERY_KEY] });
    expect(useWizardStore.getState().candidates.map(c => c.id)).toEqual(['new1']);
    expect(result.current.notice).toBe('Candidato Persona Inventada creado en la base de candidatos y seleccionado para esta oportunidad.');
    expect(result.current.open).toBe(false);
  });

  it('should not select when the limit is undefined', () => {
    const { result } = setup(undefined);
    act(() => result.current.onSuccess(CREATED_CANDIDATE));
    expect(useWizardStore.getState().candidates).toEqual([]);
    expect(result.current.notice).toContain('Selecciónalo de la lista');
  });

  it('should dismiss the notice on demand only', () => {
    const { result } = setup(5);
    act(() => result.current.onSuccess(CREATED_CANDIDATE));
    act(() => result.current.dismissNotice());
    expect(result.current.notice).toBeUndefined();
  });
});

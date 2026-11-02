import { useWizardStore } from './wizard.store';

const ANA = { id: 'c1', fullName: 'Ana', primaryRole: 'Dev' };
const LUIS = { id: 'c2', fullName: 'Luis' };

describe('useWizardStore', () => {
  beforeEach(() => useWizardStore.getState().reset());

  it('should start at the data step with empty data and no candidates', () => {
    const state = useWizardStore.getState();
    expect(state.step).toBe('data');
    expect(state.data).toEqual({ title: '', clientName: '' });
    expect(state.candidates).toEqual([]);
  });

  it('should change the step', () => {
    useWizardStore.getState().setStep('confirm');
    expect(useWizardStore.getState().step).toBe('confirm');
  });

  it('should save the step 1 data', () => {
    useWizardStore.getState().saveData({ title: 'T', clientName: 'C', ownerPmId: 'pm1' });
    expect(useWizardStore.getState().data).toEqual({ title: 'T', clientName: 'C', ownerPmId: 'pm1' });
  });

  it('should add a candidate keeping the full object', () => {
    useWizardStore.getState().toggleCandidate(ANA, 3);
    expect(useWizardStore.getState().candidates).toEqual([ANA]);
  });

  it('should remove a candidate when toggled twice', () => {
    useWizardStore.getState().toggleCandidate(ANA, 3);
    useWizardStore.getState().toggleCandidate(ANA, 3);
    expect(useWizardStore.getState().candidates).toEqual([]);
  });

  it('should ignore an addition beyond the given cap', () => {
    useWizardStore.getState().toggleCandidate(ANA, 1);
    useWizardStore.getState().toggleCandidate(LUIS, 1);
    expect(useWizardStore.getState().candidates).toEqual([ANA]);
  });

  it('should still allow removing when at the cap', () => {
    useWizardStore.getState().toggleCandidate(ANA, 1);
    useWizardStore.getState().toggleCandidate(ANA, 1);
    expect(useWizardStore.getState().candidates).toHaveLength(0);
  });

  it('should remove a candidate by id', () => {
    useWizardStore.getState().toggleCandidate(ANA, 3);
    useWizardStore.getState().toggleCandidate(LUIS, 3);
    useWizardStore.getState().removeCandidate('c1');
    expect(useWizardStore.getState().candidates).toEqual([LUIS]);
  });

  it('should reset everything', () => {
    useWizardStore.getState().setStep('confirm');
    useWizardStore.getState().saveData({ title: 'T', clientName: 'C' });
    useWizardStore.getState().toggleCandidate(ANA, 3);
    useWizardStore.getState().reset();
    const state = useWizardStore.getState();
    expect([state.step, state.data, state.candidates]).toEqual(['data', { title: '', clientName: '' }, []]);
  });

  it('should not persist to web storage', () => {
    useWizardStore.getState().saveData({ title: 'T', clientName: 'C' });
    expect(sessionStorage.length + localStorage.length).toBe(0);
  });
});

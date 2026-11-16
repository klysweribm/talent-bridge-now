import { useUiStore } from './ui.store';

describe('ui.store', () => {
  beforeEach(() => { useUiStore.setState({ activePanel: null }); });

  it('should open a panel and close it when toggled again', () => {
    useUiStore.getState().togglePanel('search');
    expect(useUiStore.getState().activePanel).toBe('search');
    useUiStore.getState().togglePanel('search');
    expect(useUiStore.getState().activePanel).toBeNull();
  });

  it('should keep a single panel open at a time', () => {
    useUiStore.getState().togglePanel('search');
    useUiStore.getState().togglePanel('notifications');
    expect(useUiStore.getState().activePanel).toBe('notifications');
    useUiStore.getState().closePanel();
    expect(useUiStore.getState().activePanel).toBeNull();
  });
});

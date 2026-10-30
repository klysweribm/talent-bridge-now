import { buildBreadcrumbs } from './buildBreadcrumbs';

describe('buildBreadcrumbs', () => {
  it('should return only Inicio for the dashboard', () => {
    expect(buildBreadcrumbs('/dashboard')).toEqual([{ label: 'Inicio' }]);
  });

  it('should return Inicio > section for a top-level section', () => {
    expect(buildBreadcrumbs('/reports')).toEqual([{ label: 'Inicio', to: '/dashboard' }, { label: 'Reportes' }]);
  });

  it('should add a third level for process creation and detail', () => {
    expect(buildBreadcrumbs('/processes/new').map(b => b.label)).toEqual(['Inicio', 'Procesos', 'Nuevo proceso']);
    expect(buildBreadcrumbs('/processes/42').at(-1)?.label).toBe('Detalle del proceso');
  });

  it('should return nothing for unknown routes', () => {
    expect(buildBreadcrumbs('/nope')).toEqual([]);
  });
});

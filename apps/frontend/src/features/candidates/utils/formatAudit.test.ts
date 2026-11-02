import { describeActor, describeUpdateCount, formatUpdatedAt } from './formatAudit';

describe('formatAudit', () => {
  it('should describe the actor with email and the Spanish role label', () => {
    expect(describeActor({ id: 'u1', email: 'ana@ibm.com', role: 'recruiter' })).toBe('ana@ibm.com (Reclutador)');
    expect(describeActor({ id: 'u2', email: 'mar@ibm.com', role: 'pm' })).toBe('mar@ibm.com (Project Manager)');
  });

  it('should pluralise the update count and say "Aún no se ha actualizado" for zero', () => {
    expect(describeUpdateCount(0)).toBe('Aún no se ha actualizado');
    expect(describeUpdateCount(1)).toBe('Actualizado 1 vez');
    expect(describeUpdateCount(3)).toBe('Actualizado 3 veces');
  });

  it('should format the date with the es-CL locale (day first)', () => {
    expect(formatUpdatedAt('2026-03-10T15:00:00.000Z')).toBe('10-03-2026');
  });
});

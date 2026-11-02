/** El índice único de `email` rechazó la inserción (carrera entre dos altas). */
export class DuplicateCandidateEmailError extends Error {
  constructor(options?: ErrorOptions) {
    super('A candidate with this email already exists', options);
    this.name = 'DuplicateCandidateEmailError';
  }
}

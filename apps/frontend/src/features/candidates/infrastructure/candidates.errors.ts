import type { ICandidate, TAiUnavailableReason } from '@ibm-talent-bridge/shared-types';

/** 503: ICA no disponible. El organismo ofrece reintentar con Clásica (acción explícita). */
export class CvExtractionUnavailableError extends Error {
  public readonly reason: TAiUnavailableReason;

  public constructor(reason: TAiUnavailableReason) {
    super(`La extracción con ICA no está disponible (${reason}).`);
    this.name = 'CvExtractionUnavailableError';
    this.reason = reason;
  }
}

/** 400 al extraer: tipo no permitido, vacío, corrupto o demasiado grande. */
export class CvInvalidFileError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'CvInvalidFileError';
  }
}

/** 400 al crear: el correo ya existe; lleva el candidato existente. */
export class DuplicateCandidateError extends Error {
  public readonly existing: ICandidate;

  public constructor(existing: ICandidate) {
    super('Ya existe un candidato con ese correo.');
    this.name = 'DuplicateCandidateError';
    this.existing = existing;
  }
}

/** 404 al actualizar: el id ya no existe. */
export class CandidateNotFoundError extends Error {
  public constructor() {
    super('El candidato ya no existe.');
    this.name = 'CandidateNotFoundError';
  }
}

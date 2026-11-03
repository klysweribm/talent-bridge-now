import { PROCESS_CREATE_ERRORS } from '../config/processCreate.constants';

/** 409: algún candidato ya pertenece a otro proceso. */
export class CandidateAlreadyAssignedError extends Error {
  public constructor() {
    super(PROCESS_CREATE_ERRORS.candidateAlreadyAssigned);
    this.name = 'CandidateAlreadyAssignedError';
  }
}

/** 400: se superó el máximo de candidatos; conserva el mensaje original del servidor. */
export class CandidateLimitExceededError extends Error {
  public readonly serverMessage: string;

  public constructor(serverMessage: string) {
    super(PROCESS_CREATE_ERRORS.candidateLimitExceeded);
    this.name = 'CandidateLimitExceededError';
    this.serverMessage = serverMessage;
  }
}

/** 404: un candidato seleccionado ya no existe. */
export class CandidateNotFoundForProcessError extends Error {
  public constructor() {
    super(PROCESS_CREATE_ERRORS.candidateNotFound);
    this.name = 'CandidateNotFoundForProcessError';
  }
}

/** 503: fallo parcial; el servidor no conservó cambios. */
export class ProcessServiceUnavailableError extends Error {
  public constructor() {
    super(PROCESS_CREATE_ERRORS.serviceUnavailable);
    this.name = 'ProcessServiceUnavailableError';
  }
}

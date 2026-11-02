/**
 * Máximo de referentes técnicos por proceso. Espejo del límite del backend
 * (capabilities/processes/domain/constants/process.constants.ts): si cambia allí, cambia aquí.
 * Deuda propuesta: exponerlo vía GET /processes/limits y eliminar el duplicado.
 */
export const TECHNICAL_REFS_MAX = 2;

/** Rol con el que se pide el listado de referentes a GET /users. */
export const TECHNICAL_REF_ROLE = 'technical_ref';

/**
 * Outbound port the health controller depends on to know whether the
 * database connection is currently usable. The concrete adapter (Mongoose
 * connection readyState today, could be swapped for another driver later)
 * lives in `infrastructure/adapters/`.
 */
export interface IDbStatusPort {
  isUp(): boolean;
}

export const DB_STATUS_PORT = Symbol('DB_STATUS_PORT');

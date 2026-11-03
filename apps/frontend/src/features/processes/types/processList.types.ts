export interface IProcessListParams {
  readonly page?:  number;
  readonly limit?: number;
  /** Filtro por rol o cliente; ausente = sin filtro. */
  readonly q?:     string;
}

export interface IPageParams {
  readonly page?:  number;
  readonly limit?: number;
}

/** Rol del usuario que crea; solo estos dos pueden crear procesos. */
export type TProcessCreatorRole = 'pm' | 'recruiter';

/** Roles listables en GET /users: los creadores más los referentes técnicos (PROC-1c). */
export type TUserOptionRole = TProcessCreatorRole | 'technical_ref';

/** Datos del paso 1; los ids de usuario son cadena vacía mientras no se elige. */
export interface IProcessDataDraft {
  readonly title:       string;
  readonly clientName:  string;
  readonly ownerPmId?:  string;
  readonly recruiterId?: string;
  /** Campos de la oportunidad (PROC-1c); `band` queda sin definir hasta que el usuario la elige. */
  readonly opportunityRole: string;
  readonly skills:          readonly string[];
  readonly roleDescription: string;
  readonly band?:           number;
  /** `YYYY-MM-DD`; '' o ausente = sin fecha de inicio. */
  readonly startDate?:      string;
}

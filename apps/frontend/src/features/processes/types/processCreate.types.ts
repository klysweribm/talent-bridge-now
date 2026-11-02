export interface IPageParams {
  readonly page?:  number;
  readonly limit?: number;
}

/** Rol del usuario que crea; solo estos dos pueden crear procesos. */
export type TProcessCreatorRole = 'pm' | 'recruiter';

/** Datos del paso 1; los ids de usuario son cadena vacía mientras no se elige. */
export interface IProcessDataDraft {
  readonly title:       string;
  readonly clientName:  string;
  readonly ownerPmId?:  string;
  readonly recruiterId?: string;
}

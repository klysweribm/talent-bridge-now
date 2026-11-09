/** Archivo subido por multipart, en memoria (nunca se escribe en disco). El nombre original no se usa ni se loguea. */
export interface IOpportunityUploadedFile {
  readonly originalname: string;
  readonly mimetype: string;
  readonly size: number;
  readonly buffer: Buffer;
}

export type TOpportunitySourceKind = 'pdf' | 'docx' | 'text';

/** Fuente ya validada por firma. El tipo lo decide el servidor, nunca el MIME ni la extensión del cliente. */
export interface IOpportunitySource<K extends TOpportunitySourceKind = TOpportunitySourceKind> {
  readonly kind: K;
  readonly data: Buffer;
}

export type TOpportunitySourceValidation =
  | { readonly ok: true; readonly source: IOpportunitySource }
  | { readonly ok: false; readonly message: string };

/** Tope de tamaño del archivo; siempre definido (la config cae a un valor por defecto). */
export interface TOpportunitySourceConfig {
  readonly maxFileBytes: number;
}

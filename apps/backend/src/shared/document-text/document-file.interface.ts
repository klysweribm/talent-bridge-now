/** Documento ya validado cuyo texto se extrae: el nombre y el MIME los fija el servidor, nunca el cliente. */
export interface IDocumentFile {
  readonly filename: string;
  readonly mimeType: string;
  readonly data: Uint8Array;
}

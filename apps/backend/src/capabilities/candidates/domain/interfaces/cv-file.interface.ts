/** CV ya validado: el nombre y el MIME los fija el servidor (según la firma), nunca el cliente. */
export interface ICvFile {
  readonly filename: string;
  readonly mimeType: string;
  readonly data: Uint8Array;
}

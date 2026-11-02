/** Archivo subido por multipart, en memoria (no se instala `@types/multer`). Nunca se escribe en disco. */
export interface ICvUploadedFile {
  readonly originalname: string;
  readonly mimetype: string;
  readonly size: number;
  readonly buffer: Buffer;
}

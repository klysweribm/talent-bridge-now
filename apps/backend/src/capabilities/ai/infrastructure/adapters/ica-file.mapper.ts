import { AiProviderError } from '../../domain/errors/ai-provider.error';

export type TIcaFileStatus = 'pending' | 'completed' | 'failed';

export interface IIcaFileState {
  readonly status: TIcaFileStatus;
  readonly content: string;
}

// U+0000–U+001F crudos dentro de un string JSON invalidan el parseo estricto.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001f]/g;

const escapeControl = (char: string): string => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;

/**
 * El GET de `/files/{id}` puede traer caracteres de control crudos dentro de strings JSON.
 * Se escapan todos antes de parsear: fuera de un string solo habría espacio en blanco, que
 * JSON.parse acepta, así que se conservan `\n`, `\r` y `\t` estructurales sustituyendo solo dentro de strings.
 */
export function parseLenientJson(text: string): unknown {
  let out = '';
  let inString = false;
  let escaped = false;
  for (const char of text) {
    if (inString && !escaped && CONTROL_CHARS.test(char)) {
      out += escapeControl(char);
    } else {
      out += char;
    }
    CONTROL_CHARS.lastIndex = 0;
    if (!inString) inString = char === '"';
    else if (escaped) escaped = false;
    else if (char === '\\') escaped = true;
    else if (char === '"') inString = false;
  }
  return JSON.parse(out) as unknown;
}

export function mapIcaFileUpload(json: unknown): string {
  const id = (typeof json === 'object' && json !== null ? (json as { id?: unknown }).id : undefined);
  if (typeof id !== 'string' || id.length === 0) throw new AiProviderError('ICA file upload returned no id', 'INVALID_OUTPUT');
  return id;
}

export function mapIcaFileState(json: unknown): IIcaFileState {
  const data = (typeof json === 'object' && json !== null ? (json as { data?: unknown }).data : undefined) as
    | { status?: unknown; content?: unknown }
    | undefined;
  const status = data?.status;
  if (status === 'completed') {
    if (typeof data?.content !== 'string') throw new AiProviderError('ICA file has no content', 'INVALID_OUTPUT');
    return { status, content: data.content };
  }
  if (status === 'pending' || status === 'processing') return { status: 'pending', content: '' };
  throw new AiProviderError('ICA could not process the file', 'INVALID_OUTPUT');
}

import { redact } from './redact';

const SEPARATOR = '---------';
const FRAME_TOP = '┌─';
const FRAME_BOTTOM = '└─';
const ANONYMOUS_USER = 'anónimo';
const INDENT = '  ';
const CONTROLLER_SUFFIX = /Controller$/;
const CAMEL_BOUNDARY = /([a-z0-9])([A-Z])/g;
const LINE_BREAKS = /[\r\n]+/g;
const REJECTED_NOTE = 'rechazada antes del handler (guard/throttler/ruta)';

export interface IRequestView {
  readonly id: string;
  readonly method: string;
  readonly url: string;
  readonly capability?: string;
  readonly handler?: string;
  readonly user?: string;
  readonly headers: unknown;
  readonly query: unknown;
  readonly body: unknown;
}

export interface IResponseView {
  readonly id: string;
  readonly status: number;
  readonly elapsedMs: number;
  readonly body?: unknown;
  readonly note?: string;
}

/** Evita que un método/URL con saltos de línea falsifique entradas del log. */
export function sanitizeLine(value: string): string {
  return value.replace(LINE_BREAKS, ' ');
}

export function toJson(value: unknown): string {
  const serialized = JSON.stringify(redact(value));
  return serialized === undefined ? 'undefined' : serialized;
}

/** `AuthController` -> `auth`, `ProcessStagesController` -> `process-stages`. */
export function deriveCapability(controllerName: string): string {
  return controllerName.replace(CONTROLLER_SUFFIX, '').replace(CAMEL_BOUNDARY, '$1-$2').toLowerCase();
}

export function formatRequest(view: IRequestView): string {
  const meta = [
    view.capability ? `capability: ${view.capability}` : undefined,
    view.handler,
    `user: ${view.user ?? ANONYMOUS_USER}`,
  ].filter((part): part is string => part !== undefined);
  return [
    `${FRAME_TOP} #${view.id}  ${sanitizeLine(view.method)} ${sanitizeLine(view.url)}   ${meta.join(' · ')}`,
    SEPARATOR,
    'Request:',
    SEPARATOR,
    `headers: ${toJson(view.headers)}`,
    `query:   ${toJson(view.query)}`,
    `body:    ${toJson(view.body)}`,
  ].join('\n');
}

export function formatResponse(view: IResponseView): string {
  const lines = [`#${view.id}`, SEPARATOR, 'Response', SEPARATOR];
  if (view.note) lines.push(`nota: ${view.note}`);
  lines.push(`status: ${view.status} · ${view.elapsedMs} ms`);
  if (view.body !== undefined) lines.push(`body: ${toJson(view.body)}`);
  lines.push(FRAME_BOTTOM);
  return lines.join('\n');
}

export function formatAdapterLine(
  id: string,
  depth: number,
  label: string,
  detail: string,
): string {
  return `#${id} ${INDENT.repeat(depth + 1)}↳ [${label}] ${detail}`;
}

export const REJECTED_BEFORE_HANDLER_NOTE = REJECTED_NOTE;

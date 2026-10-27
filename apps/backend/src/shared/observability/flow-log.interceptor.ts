import {
  HttpException,
  HttpStatus,
  Injectable,
  RequestMethod,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { HTTP_CODE_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import type { Request } from 'express';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { flowStorage } from './flow-context';
import { deriveCapability, formatRequest, formatResponse } from './flow-log.format';
import { FlowLogService } from './flow-log.service';

function describeUser(user: unknown): string | undefined {
  if (typeof user !== 'object' || user === null) return undefined;
  const { email, role } = user as { email?: unknown; role?: unknown };
  if (typeof email !== 'string') return undefined;
  return typeof role === 'string' ? `${email} (${role})` : email;
}

/** Nest fija el status de éxito después de los interceptors, así que se deduce del metadata. */
function successStatus(handler: object): number {
  const explicit = Reflect.getMetadata(HTTP_CODE_METADATA, handler) as number | undefined;
  if (explicit !== undefined) return explicit;
  const method = Reflect.getMetadata(METHOD_METADATA, handler) as RequestMethod | undefined;
  return method === RequestMethod.POST ? HttpStatus.CREATED : HttpStatus.OK;
}

@Injectable()
export class FlowLogInterceptor implements NestInterceptor {
  constructor(private readonly flowLog: FlowLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const store = flowStorage.getStore();
    if (!this.flowLog.enabled || !store || context.getType() !== 'http') return next.handle();

    store.reachedHandler = true;
    store.capability = deriveCapability(context.getClass().name);
    const request = context.switchToHttp().getRequest<Request & { user?: unknown }>();

    this.flowLog.emit(
      formatRequest({
        id: store.id,
        method: request.method,
        url: request.originalUrl,
        capability: store.capability,
        handler: `${context.getClass().name}.${context.getHandler().name}`,
        user: describeUser(request.user),
        headers: request.headers,
        query: request.query,
        body: request.body,
      }),
    );

    const elapsed = (): number => Date.now() - store.startedAt;
    return next.handle().pipe(
      tap((body: unknown) =>
        this.flowLog.emit(
          formatResponse({
            id: store.id,
            status: successStatus(context.getHandler()),
            elapsedMs: elapsed(),
            body,
          }),
        ),
      ),
      catchError((error: unknown) => {
        const status =
          error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const message = error instanceof Error ? error.message : String(error);
        this.flowLog.emit(
          formatResponse({ id: store.id, status, elapsedMs: elapsed(), body: { error: message } }),
        );
        return throwError(() => error);
      }),
    );
  }
}

export interface IHealthStatus {
  readonly status: 'ok' | 'error';
  readonly timestamp: string;
  readonly service: string;
  readonly database: 'up' | 'down';
}

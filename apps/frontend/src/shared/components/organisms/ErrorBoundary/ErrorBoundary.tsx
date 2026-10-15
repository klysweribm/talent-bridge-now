import { Component, type ErrorInfo, type JSX, type ReactNode } from 'react';
import { Icon } from '@shared/components/atoms/Icon';
import { Button } from '@shared/components/atoms/Button';

/**
 * ErrorBoundary — red de seguridad global de la demo (QW-1). Clase porque
 * React solo soporta `componentDidCatch`/`getDerivedStateFromError` en
 * componentes de clase; envuelve el contenido ruteado dentro de `AppLayout`
 * para que un error de render no deje la pantalla en blanco.
 */
export interface ErrorBoundaryProps {
  readonly children: ReactNode;
}

interface ErrorBoundaryState {
  readonly error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { error: null };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console -- único canal disponible sin un servicio de monitoreo configurado aún
    console.error('[ErrorBoundary] Unhandled render error', error, info.componentStack);
  }

  private readonly handleRetry = (): void => {
    this.setState({ error: null });
  };

  public render(): JSX.Element | ReactNode {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex flex-col items-center justify-center gap-base h-full min-h-[60vh] px-xl py-2xl text-center">
        <span className="w-16 h-16 rounded-full bg-status-danger-bg flex items-center justify-center text-status-danger">
          <Icon name="error" size={32} />
        </span>
        <h1 className="text-headline-md text-text-primary">Algo salió mal</h1>
        <p className="text-body-md text-text-secondary max-w-[480px]">
          Ocurrió un error inesperado al renderizar esta sección. Puedes
          intentar de nuevo o volver más tarde.
        </p>
        <Button type="button" onClick={this.handleRetry}>
          Reintentar
        </Button>
      </div>
    );
  }
}

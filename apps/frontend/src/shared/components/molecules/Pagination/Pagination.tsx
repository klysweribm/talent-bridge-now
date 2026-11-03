import { Button } from '@shared/components/atoms/Button';

export interface PaginationProps {
  readonly page:         number;
  readonly totalPages:   number;
  readonly onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps): JSX.Element {
  return (
    <nav aria-label="Paginación" className="flex items-center justify-end gap-md">
      <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Anterior
      </Button>
      <span className="text-body-md text-text-secondary">Página {page} de {totalPages}</span>
      <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Siguiente
      </Button>
    </nav>
  );
}

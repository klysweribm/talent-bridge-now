import { Icon } from '@shared/components/atoms/Icon';

export interface PaginationProps {
  readonly page:         number;
  readonly totalPages:   number;
  readonly onPageChange: (page: number) => void;
  /** Con `totalItems` se muestra el bloque izquierdo (elementos por página y rango). */
  readonly totalItems?:  number;
  readonly pageSize?:    number;
}

const ARROW = 'flex h-12 w-12 items-center justify-center border-l border-carbon-gray-20 text-carbon-gray-100 hover:bg-carbon-gray-hover disabled:text-carbon-gray-30 disabled:hover:bg-transparent disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-carbon-blue-60';

function ItemsSummary({ page, pageSize, totalItems }: { readonly page: number; readonly pageSize: number; readonly totalItems: number }): JSX.Element {
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);
  return (
    <div className="flex items-center">
      <span className="pr-base">Elementos por página: {pageSize}</span>
      <span className="border-l border-carbon-gray-20 pl-base">{from}–{to} de {totalItems} elementos</span>
    </div>
  );
}

export function Pagination({ page, totalPages, onPageChange, totalItems, pageSize = 10 }: PaginationProps): JSX.Element {
  return (
    <nav aria-label="Paginación" className="flex h-12 items-center justify-between border-t border-carbon-gray-20 bg-white pl-base text-body text-carbon-gray-70">
      {totalItems === undefined ? <span /> : <ItemsSummary page={page} pageSize={pageSize} totalItems={totalItems} />}
      <div className="flex items-center">
        <span className="pr-base">Página {page} de {totalPages}</span>
        <button type="button" aria-label="Anterior" className={ARROW} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <Icon name="chevron-left" size={16} />
        </button>
        <button type="button" aria-label="Siguiente" className={ARROW} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <Icon name="chevron-right" size={16} />
        </button>
      </div>
    </nav>
  );
}

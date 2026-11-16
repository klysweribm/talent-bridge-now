import { useEffect, useRef, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@shared/components/atoms/Icon';
import { SearchResultGroups } from '@shared/components/molecules/SearchResultGroups/SearchResultGroups';
import { SEARCH_PANEL_ID, SHELL_COPY, searchNoResults } from '@shared/config/shell.copy';
import { useDialogFocus } from '@shared/hooks/useDialogFocus';
import { useGlobalSearch } from '@shared/hooks/useGlobalSearch';

export interface SearchPanelProps {
  readonly onClose:        () => void;
  /** Disparador al que vuelve el foco al cerrar. */
  readonly returnFocusTo?: () => HTMLElement | null;
}

/** Panel de búsqueda global (overlay desde el sidebar hacia la derecha). Se monta solo abierto. */
export function SearchPanel({ onClose, returnFocusTo }: SearchPanelProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { query, setQuery, groups } = useGlobalSearch();
  useDialogFocus(ref, returnFocusTo, onClose);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const hasQuery = query.trim() !== '';
  return (
    <>
      <div aria-hidden="true" onClick={onClose} className="fixed inset-x-0 top-header bottom-0 z-scrim bg-scrim-light" />
      <div
        ref={ref} id={SEARCH_PANEL_ID} role="dialog" aria-label={SHELL_COPY.searchPanelLabel} tabIndex={-1}
        className="fixed top-header md:left-sidebar left-0 right-0 z-panel flex flex-col max-h-[70vh] bg-white shadow-overlay"
      >
        <div className="flex items-center h-14 border-b border-carbon-gray-20">
          <Icon name="search" size={20} className="mx-md ml-lg text-carbon-gray-100" />
          <input
            ref={inputRef} type="search" value={query} onChange={event => setQuery(event.target.value)}
            aria-label={SHELL_COPY.searchInputLabel} placeholder={SHELL_COPY.searchPlaceholder}
            className="flex-1 h-[54px] bg-transparent text-h2 text-carbon-gray-100 outline-none"
          />
        </div>
        {!hasQuery && <p className="px-lg py-base text-carbon-gray-70">{SHELL_COPY.searchEmpty}</p>}
        {hasQuery && groups.length === 0 && <p className="px-lg py-base text-carbon-gray-70">{searchNoResults(query)}</p>}
        <SearchResultGroups groups={groups} onSelect={to => { navigate(to); onClose(); }} />
      </div>
    </>
  );
}

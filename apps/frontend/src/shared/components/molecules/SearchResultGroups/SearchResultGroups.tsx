import type { JSX } from 'react';
import type { ISearchGroup } from '@shared/utils/buildSearchGroups';

export interface SearchResultGroupsProps {
  readonly groups:   readonly ISearchGroup[];
  readonly onSelect: (to: string) => void;
}

/** Resultados de la búsqueda global agrupados por tipo. Solo props. */
export function SearchResultGroups({ groups, onSelect }: SearchResultGroupsProps): JSX.Element {
  return (
    <div className="overflow-y-auto pb-sm">
      {groups.map(group => (
        <section key={group.id} aria-label={group.title}>
          <h3 className="px-lg pt-md pb-xs text-body-sm text-carbon-gray-70">{`${group.title} · ${group.items.length}`}</h3>
          <ul>
            {group.items.map(item => (
              <li key={item.id}>
                <button
                  type="button" onClick={() => onSelect(item.to)}
                  className="flex w-full justify-between gap-base px-lg py-[10px] text-left hover:bg-carbon-gray-hover focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-carbon-blue-60"
                >
                  <span className="flex flex-col min-w-0">
                    <span className="text-body text-carbon-gray-100">{item.title}</span>
                    <span className="text-body-sm text-carbon-gray-70">{item.sub}</span>
                  </span>
                  <span className="font-mono text-body-sm text-carbon-gray-60 whitespace-nowrap">{item.meta}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

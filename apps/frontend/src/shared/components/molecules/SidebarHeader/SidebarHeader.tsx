import type { JSX } from 'react';
import { BRAND } from '@/config/brand';

/** Celda de marca del header (sin colapso desde el rediseño): ancho del sidebar en desktop. */
export function SidebarHeader(): JSX.Element {
  return (
    <div className="flex items-center px-base md:w-sidebar md:border-r border-carbon-gray-80 text-body text-white whitespace-nowrap">
      <span className="font-semibold tracking-[0.5px]">{BRAND.companyName}</span>
      <span className="ml-1">{BRAND.productShortName}</span>
    </div>
  );
}

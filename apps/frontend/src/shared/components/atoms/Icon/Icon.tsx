import { createElement, type CSSProperties, type JSX } from 'react';
import { AUTH_ICON_DEFS, type ISvgIconDef } from './icon-paths';
import { NAV_ICON_DEFS } from './nav-icon-paths';

const SVG_ICON_DEFS: Readonly<Record<string, ISvgIconDef>> = { ...AUTH_ICON_DEFS, ...NAV_ICON_DEFS };

/**
 * Icon — wrapper unificado para iconos del sistema.
 *
 * Estrategia dual:
 * - SVG inline (datos en `icon-paths.ts`) para iconos críticos offline.
 * - Material Symbols Outlined (font icon) como fallback.
 *
 * Uso: <Icon name="mail" size={20} className="text-outline" />
 */

export interface IconProps {
  readonly name:       string;
  readonly size?:      number;
  readonly className?: string;
  readonly style?:     CSSProperties;
}

function renderSvgIcon(def: ISvgIconDef, size: number): JSX.Element {
  return createElement(
    'svg',
    {
      width: size, height: size, viewBox: def.viewBox, fill: def.fill,
      stroke: def.stroke, strokeWidth: def.strokeWidth,
      strokeLinecap: def.strokeLinecap, strokeLinejoin: def.strokeLinejoin,
    },
    def.children.map((child, i) => createElement(child.tag, { ...child.attrs, key: i })),
  );
}

export function Icon({ name, size = 20, className = '', style }: IconProps): JSX.Element {
  const def = SVG_ICON_DEFS[name];

  if (def) {
    return (
      <span
        aria-hidden="true"
        className={`inline-flex items-center justify-center flex-shrink-0 ${className}`}
        style={{ width: size, height: size, ...style }}
      >
        {renderSvgIcon(def, size)}
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined select-none ${className}`}
      style={{ fontSize: size, ...style }}
    >
      {name}
    </span>
  );
}

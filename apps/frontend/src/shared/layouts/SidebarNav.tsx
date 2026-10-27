import type { CSSProperties, JSX, MouseEvent, ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@features/auth/store/auth.store';
import { useLogoutMutation } from '@features/auth/hooks/useLogoutMutation';
import { useUiStore } from '@shared/store/ui.store';
import { Icon } from '@shared/components/atoms/Icon';
import { NAVIGATION_ITEMS } from '@shared/config/navigation';

// Íconos propios de controles del sidebar (no son items de navegación, por
// lo que no viven en `navigation.ts`) — DT-007 moverá el resto a Etapa 2.
const Icons = {
  logout:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  paintBucket: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M19 11V4a2 2 0 0 0-2-2H6L2 6l4 4h9"/><path d="m19 11-7 7-4-4 7-7"/><path d="M18 22a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>,
} as const;

// ─── Botón de control reutilizable ────────────────────────────
interface ICtrlBtnProps {
  readonly label:     string;
  readonly onClick:   () => void;
  readonly children:  ReactNode;
  readonly ctrlIcon:  string;
  readonly ctrlHover: string;
}

function CtrlBtn({
  label, onClick, children, ctrlIcon, ctrlHover,
}: ICtrlBtnProps): JSX.Element {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex items-center justify-center flex-shrink-0"
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        padding: '4px', color: ctrlIcon, borderRadius: '4px',
        transition: 'color 150ms',
      }}
      onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = ctrlHover; }}
      onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = ctrlIcon; }}
    >
      {children}
    </button>
  );
}

export function SidebarNav(): JSX.Element {
  const user                                           = useAuthStore(state => state.user);
  const logout                                         = useLogoutMutation();
  const { sidebarCollapsed, sidebarDark,
          toggleSidebarCollapsed, toggleSidebarTheme } = useUiStore();

  const visibleItems = NAVIGATION_ITEMS.filter(
    item => user?.role && item.roles.includes(user.role),
  );

  const handleLogout = (): void => {
    logout.mutate('manual');
  };

  // ─── Paleta según tema ────────────────────────────────────
  const T = sidebarDark
    ? {
        bg: '#003099', border: '#0039b4',
        logo: { bg: '#ffffff', text: '#003099' }, brand: '#ffffff',
        navText: '#b7c4ff', navHoverBg: '#0039b4',
        navActiveBg: '#0043ce', navActiveText: '#ffffff',
        iconColor: '#b7c4ff',
        footerText: '#ffffff', footerSub: '#b7c4ff',
        ctrlIcon: '#b7c4ff', ctrlHover: '#ffffff',
        divider: '#0039b4', supportBg: '#002580', supportText: '#b7c4ff',
      }
    : {
        bg: '#ffffff', border: '#e5e7eb',
        logo: { bg: '#0043ce', text: '#ffffff' }, brand: '#161616',
        navText: '#525252', navHoverBg: '#f3f3f3',
        navActiveBg: '#dce1ff', navActiveText: '#003099',
        iconColor: '#525252',
        footerText: '#161616', footerSub: '#525252',
        ctrlIcon: '#747686', ctrlHover: '#161616',
        divider: '#e5e7eb', supportBg: '#f9f9f9', supportText: '#525252',
      };

  // ─── NavLink style helper ─────────────────────────────────
  const navLinkStyle = (isActive: boolean): CSSProperties => ({
    color:           isActive ? T.navActiveText : T.navText,
    backgroundColor: isActive ? T.navActiveBg  : 'transparent',
    fontSize: '13px', textDecoration: 'none',
  });

  // ═══════════════════════════════════════════════════════════
  // MOBILE — Bottom Navigation Bar (fija, visible solo < 768px)
  // ═══════════════════════════════════════════════════════════
  const MobileBottomNav = (
    <nav
      aria-label="Navegación principal"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex flex-row items-stretch"
      style={{
        height: '56px',
        backgroundColor: T.bg,
        borderTop: `1px solid ${T.border}`,
        boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
      }}
    >
      {visibleItems.slice(0, 5).map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          aria-label={item.label}
          title={item.label}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-150"
          style={({ isActive }) => ({
            ...navLinkStyle(isActive),
            borderRadius: 0,
            padding: '6px 4px',
            minWidth: 0,
          })}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = T.navHoverBg;
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            // NavLink recalcula background via style prop en el siguiente render;
            // usar transparent como fallback
            el.style.backgroundColor = 'transparent';
          }}
        >
          {({ isActive }) => (
            <>
              <span
                className="flex items-center justify-center"
                style={{ color: isActive ? T.navActiveText : T.iconColor }}
              >
                <Icon name={item.icon} size={20} />
              </span>
              <span
                style={{
                  fontSize: '10px', lineHeight: '12px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? T.navActiveText : T.navText,
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap', maxWidth: '100%',
                }}
              >
                {item.mobileLabel}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );

  // ═══════════════════════════════════════════════════════════
  // DESKTOP — Sidebar vertical (visible solo ≥ 768px)
  // ═══════════════════════════════════════════════════════════
  // Duración de la transición debe coincidir con --anim-slow (1000ms) en index.css
  const TRANSITION = 'var(--anim-slow, 1s) var(--ease-in-out, ease-in-out)';

  // Elementos de texto: se desvanecen + contraen horizontalmente sin desmontarse del DOM
  const textRevealStyle = (visible: boolean): React.CSSProperties => ({
    maxWidth:   visible ? '160px' : '0',
    opacity:    visible ? 1        : 0,
    overflow:   'hidden',
    whiteSpace: 'nowrap',
    transition: `max-width ${TRANSITION}, opacity var(--anim-base, 300ms) var(--ease-in-out, ease-in-out)`,
    display:    'inline-block',
  });

  // Botones/iconos que solo aparecen en expanded: colapsan a width:0
  const btnRevealStyle = (visible: boolean): React.CSSProperties => ({
    width:    visible ? '28px' : '0',
    opacity:  visible ? 1      : 0,
    overflow: 'hidden',
    flexShrink: 0,
    transition: `width ${TRANSITION}, opacity var(--anim-base, 300ms) var(--ease-in-out, ease-in-out)`,
  });

  // Bloque que expande/contrae verticalmente (footer extendido)
  const blockRevealStyle = (visible: boolean): React.CSSProperties => ({
    maxHeight:  visible ? '200px' : '0',
    opacity:    visible ? 1       : 0,
    overflow:   'hidden',
    transition: `max-height ${TRANSITION}, opacity var(--anim-base, 300ms) var(--ease-in-out, ease-in-out)`,
  });

  const expanded = !sidebarCollapsed;

  const DesktopSidebar = (
    <nav
      aria-label="Navegación principal"
      className="hidden md:flex sidebar-collapse flex-shrink-0 flex-col h-full"
      style={{
        width:           expanded ? '220px' : '60px',
        minWidth:        expanded ? '220px' : '60px',
        backgroundColor: T.bg,
        borderRight:     `1px solid ${T.border}`,
      }}
    >
      {/* ── Header — único árbol DOM, sin desmonte ───────────── */}
      <div
        className="flex items-center flex-shrink-0 px-3"
        style={{
          borderBottom: `1px solid ${T.border}`,
          minHeight:    '56px',
          gap:          '6px',
          // En collapsed: centrar horizontalmente el badge IBM
          justifyContent: expanded ? 'flex-start' : 'center',
          transition: `justify-content ${TRANSITION}`,
          overflow: 'hidden',
        }}
      >
        {/* Badge IBM — siempre visible */}
        <span
          className="flex-shrink-0 font-bold select-none flex items-center justify-center"
          style={{
            backgroundColor: T.logo.bg, color: T.logo.text,
            fontSize: '11px', fontWeight: 700,
            width: '30px', height: '20px',
            borderRadius: '4px', letterSpacing: '0.02em',
          }}
        >
          IBM
        </span>

        {/* "Talent Bridge" — se desvanece y contrae al colapsar */}
        <span
          className="font-semibold"
          style={{
            ...textRevealStyle(expanded),
            fontSize: '13px', color: T.brand, letterSpacing: '-0.01em',
          }}
        >
          Talent Bridge
        </span>

        {/* Botón tema pincel — solo visible en expanded */}
        <span style={btnRevealStyle(expanded)}>
          <CtrlBtn
            label={sidebarDark ? 'Tema claro' : 'Tema oscuro'}
            onClick={toggleSidebarTheme}
            ctrlIcon={T.ctrlIcon}
            ctrlHover={T.ctrlHover}
          >
            {Icons.paintBucket}
          </CtrlBtn>
        </span>

        {/* Botón colapsar — ícono rota 180° vía CSS en lugar de swap */}
        <span
          style={{
            flexShrink: 0,
            // En collapsed el botón sigue siendo visible pero alejado del texto
            marginLeft: expanded ? 'auto' : '0',
          }}
        >
          <CtrlBtn
            label={expanded ? 'Colapsar menú' : 'Expandir menú'}
            onClick={toggleSidebarCollapsed}
            ctrlIcon={T.ctrlIcon}
            ctrlHover={T.ctrlHover}
          >
            {/* SVG rota 180° cuando collapsed */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="16"
              height="16"
              style={{
                transform:  expanded ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: `transform ${TRANSITION}`,
              }}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </CtrlBtn>
        </span>
      </div>

      {/* ── Items de navegación ───────────────────────────────── */}
      <ul
        role="list"
        className="flex-1 py-2 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden"
        style={{
          padding:    expanded ? '8px' : '8px 4px',
          transition: `padding ${TRANSITION}`,
        }}
      >
        {visibleItems.map(item => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              aria-label={item.label}
              title={item.label}
              className="flex items-center rounded-lg transition-colors duration-150"
              style={({ isActive }) => ({
                ...navLinkStyle(isActive),
                justifyContent: expanded ? 'flex-start' : 'center',
                gap:            expanded ? '8px'        : '0',
                padding:        expanded ? '8px'        : '10px 0',
                minHeight:      '36px',
              })}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = T.navHoverBg;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }}
            >
              {({ isActive }) => (
                <>
                  {/* Icono — siempre montado, siempre visible */}
                  <span
                    className="flex-shrink-0 flex items-center justify-center"
                    style={{
                      width: '20px', height: '20px',
                      color: isActive ? T.navActiveText : T.iconColor,
                    }}
                  >
                    <Icon name={item.icon} size={20} />
                  </span>
                  {/* Label — siempre montado, transiciona con CSS */}
                  <span
                    style={{
                      ...textRevealStyle(expanded),
                      color: isActive ? T.navActiveText : T.navText,
                    }}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* ── Footer — único árbol DOM, sin desmonte ───────────── */}
      <div style={{ borderTop: `1px solid ${T.divider}` }}>
        {/* Avatar siempre visible */}
        <div
          className="flex items-center"
          style={{
            padding:        expanded ? '12px' : '12px 0',
            justifyContent: expanded ? 'flex-start' : 'center',
            gap:            '8px',
            backgroundColor: T.supportBg,
            transition: `padding ${TRANSITION}, justify-content ${TRANSITION}`,
            overflow: 'hidden',
          }}
        >
          <span
            className="w-7 h-7 rounded-full flex-shrink-0 inline-flex items-center justify-center text-white font-semibold"
            style={{ backgroundColor: '#0043ce', fontSize: '11px' }}
            title={user?.name ?? 'Usuario'}
          >
            {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
          </span>

          {/* Nombre + rol — se contraen al colapsar */}
          <div
            className="flex flex-col min-w-0"
            style={textRevealStyle(expanded)}
          >
            <span className="font-semibold truncate" style={{ fontSize: '12px', color: T.footerText }}>
              {user?.name ?? 'Usuario IBM'}
            </span>
            <span className="truncate" style={{ fontSize: '11px', color: T.footerSub }}>
              {user?.role === 'recruiter' ? 'Reclutador Lead' :
               user?.role === 'pm'        ? 'Project Manager' : 'Referente Técnico'}
            </span>
          </div>
        </div>

        {/* Bloque Centro de Soporte — expande/contrae verticalmente */}
        <div style={blockRevealStyle(expanded)}>
          <div className="px-3 pb-3" style={{ backgroundColor: T.supportBg, fontSize: '11px', color: T.supportText }}>
            <p className="font-medium mb-0.5" style={{ color: T.footerText }}>Centro de Soporte</p>
            <p style={{ margin: 0 }}>Guía metodológica de reclutamiento IBM.</p>
            <a
              href="#"
              className="inline-flex items-center gap-1 mt-1"
              style={{ color: '#0f62fe', fontSize: '11px', textDecoration: 'none', fontWeight: 500 }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              Documentación
            </a>
          </div>
        </div>

        {/* Email + logout — siempre presentes */}
        <div
          className="flex items-center justify-between px-3 py-2"
          style={{ borderTop: `1px solid ${T.divider}` }}
        >
          {/* Email — se contrae al colapsar */}
          <span
            style={{
              ...textRevealStyle(expanded),
              fontSize: '11px', color: T.footerSub,
            }}
          >
            {user?.email ?? ''}
          </span>

          <CtrlBtn
            label="Cerrar sesión"
            onClick={handleLogout}
            ctrlIcon={T.ctrlIcon}
            ctrlHover="#da1e28"
          >
            {Icons.logout}
          </CtrlBtn>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      {DesktopSidebar}
      {MobileBottomNav}
    </>
  );
}

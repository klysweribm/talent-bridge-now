import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@features/auth/store/auth.store';
import { SearchBar } from '@shared/components/molecules/SearchBar';
import { StageChip } from '@shared/components/atoms/StageChip';
import { AvatarGroup } from '@shared/components/molecules/AvatarGroup';
import { useState } from 'react';

// ─── Datos mock (se reemplazan con React Query en Fase 6) ─────
const MOCK_KPI = {
  processes:   { value: 12, trend: '+2 vs mes anterior' },
  candidates:  { value: 34, trend: '+6 nuevos esta semana' },
  interviews:  { value: 8,  trend: '3 pendientes confirmación' },
  hired:       { value: 5,  goal: 8 },
} as const;

const MOCK_PROCESSES = [
  {
    id: '1',
    title: 'Desarrollador React & Node.js Senior',
    client: 'Banco Santander',
    stage: 'Entrevista Técnica' as const,
    candidates: 7,
    referents: [{ name: 'Carlos López' }, { name: 'Ana García' }],
    daysOpen: 14,
  },
  {
    id: '2',
    title: 'Arquitecto Cloud AWS / IBM Cloud',
    client: 'Telefónica',
    stage: '1ra Entrevista' as const,
    candidates: 4,
    referents: [{ name: 'María Rodríguez' }],
    daysOpen: 7,
  },
  {
    id: '3',
    title: 'Data Engineer — Pipeline & MLOps',
    client: 'Claro Colombia',
    stage: 'Inicial' as const,
    candidates: 12,
    referents: [{ name: 'Juan Pérez' }, { name: 'Laura Martínez' }],
    daysOpen: 3,
  },
] as const;

// ─── Entrevistas próximas (mock) ──────────────────────────────
const MOCK_INTERVIEWS = [
  { id: '1', candidate: 'Sergio Vega',    role: 'React Senior',    time: '10:00', stage: 'Entrevista Técnica' as const },
  { id: '2', candidate: 'Lucía Morales',  role: 'Cloud Architect', time: '14:30', stage: '1ra Entrevista' as const },
  { id: '3', candidate: 'Pablo Ramírez',  role: 'Data Engineer',   time: '16:00', stage: 'Inicial' as const },
] as const;

export function DashboardPage() {
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filteredProcesses = MOCK_PROCESSES.filter(
    p =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase()),
  );

  const hiredPercent = Math.round((MOCK_KPI.hired.value / MOCK_KPI.hired.goal) * 100);

  return (
    <div className="px-xl py-lg flex flex-col gap-lg w-full max-w-[1520px] mx-auto">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-md">
        <div className="flex flex-col">
          <div className="flex items-center gap-xs">
            <span className="text-label-sm uppercase tracking-wider text-text-secondary">Visión Operativa</span>
            <span className="text-outline-variant text-body-md">•</span>
            <span className="text-label-sm uppercase tracking-wider text-primary-interactive font-semibold">Q1 IBM Consulting</span>
          </div>
          <h1 className="text-headline-lg text-text-primary tracking-tight mt-2xs">
            Dashboard de Reclutamiento
          </h1>
          <p className="text-body-md text-text-secondary mt-2xs">
            Bienvenido/a, <strong className="font-medium text-text-primary">{user?.name ?? 'Usuario'}</strong> • Gestiona tus procesos activos y coordinación técnica regional
          </p>
        </div>

        <div className="flex items-center gap-sm self-start md:self-auto">
          <button
            type="button"
            className="inline-flex items-center gap-xs px-base h-10 rounded-lg bg-surface-high hover:bg-surface-highest text-text-primary text-body-md-medium transition-colors"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-text-secondary">tune</span>
            Filtro Global
          </button>
          <button
            type="button"
            aria-label="Nuevo Proceso de Selección"
            onClick={() => navigate('/processes/new')}
            className="inline-flex items-center gap-xs px-base h-10 rounded-lg bg-primary-container hover:bg-primary text-white text-body-md-medium transition-colors shadow-raised"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[20px]">add</span>
            Nuevo Proceso
          </button>
        </div>
      </section>

      {/* ── KPI CARDS ───────────────────────────────────────── */}
      <section aria-label="Indicadores Clave" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-base">

        {/* Procesos Activos */}
        <article aria-label="Procesos Activos: 12" className="bg-surface-card p-base rounded-xl shadow-raised flex flex-col justify-between h-36 border border-[#e0e0e0]">
          <div className="flex items-center justify-between">
            <span className="text-body-md-medium text-text-secondary flex items-center gap-xs">
              <span aria-hidden="true" className="material-symbols-outlined text-primary-interactive text-[18px]">sync</span>
              Procesos Activos
            </span>
            <span className="text-label-sm text-text-secondary bg-surface-low px-xs py-2xs rounded">Total LatAm</span>
          </div>
          <div className="flex items-baseline justify-between mt-auto">
            <div className="flex items-baseline gap-xs">
              <span className="text-[42px] font-semibold text-text-primary leading-none">{MOCK_KPI.processes.value}</span>
              <span className="text-body-md text-text-secondary">vacantes</span>
            </div>
            <span className="flex items-center gap-2xs px-xs py-2xs rounded-lg bg-status-success-bg text-status-success text-label-md">
              <span aria-hidden="true" className="material-symbols-outlined text-[14px]">trending_up</span>
              {MOCK_KPI.processes.trend}
            </span>
          </div>
        </article>

        {/* Candidatos en Proceso */}
        <article aria-label="Candidatos en Proceso: 34" className="bg-surface-card p-base rounded-xl shadow-raised flex flex-col justify-between h-36 border border-[#e0e0e0]">
          <div className="flex items-center justify-between">
            <span className="text-body-md-medium text-text-secondary flex items-center gap-xs">
              <span aria-hidden="true" className="material-symbols-outlined text-primary-interactive text-[18px]">person</span>
              Candidatos en Proceso
            </span>
            <span className="text-label-sm text-text-secondary bg-surface-low px-xs py-2xs rounded">Pipeline Activo</span>
          </div>
          <div className="flex items-baseline justify-between mt-auto">
            <div className="flex items-baseline gap-xs">
              <span className="text-[42px] font-semibold text-text-primary leading-none">{MOCK_KPI.candidates.value}</span>
              <span className="text-body-md text-text-secondary">talentos</span>
            </div>
            <span className="flex items-center gap-2xs px-xs py-2xs rounded-lg bg-[#dbe1ff] text-[#00174c] text-label-md">
              <span aria-hidden="true" className="material-symbols-outlined text-[14px]">group_add</span>
              {MOCK_KPI.candidates.trend}
            </span>
          </div>
        </article>

        {/* Entrevistas Esta Semana */}
        <article aria-label="Entrevistas Esta Semana: 8" className="bg-surface-card p-base rounded-xl shadow-raised flex flex-col justify-between h-36 border border-[#e0e0e0]">
          <div className="flex items-center justify-between">
            <span className="text-body-md-medium text-text-secondary flex items-center gap-xs">
              <span aria-hidden="true" className="material-symbols-outlined text-primary-interactive text-[18px]">calendar_today</span>
              Entrevistas Esta Semana
            </span>
            <span className="text-label-sm text-text-secondary bg-surface-low px-xs py-2xs rounded">Sincrónicas</span>
          </div>
          <div className="flex items-baseline justify-between mt-auto">
            <div className="flex items-baseline gap-xs">
              <span className="text-[42px] font-semibold text-text-primary leading-none">{MOCK_KPI.interviews.value}</span>
              <span className="text-body-md text-text-secondary">sesiones</span>
            </div>
            <span className="flex items-center gap-2xs px-xs py-2xs rounded-lg bg-status-warning-bg text-[#8a6100] text-label-md">
              <span aria-hidden="true" className="material-symbols-outlined text-[14px]">warning</span>
              {MOCK_KPI.interviews.trend}
            </span>
          </div>
        </article>

        {/* Contratados Este Mes */}
        <article aria-label={`Contratados Este Mes: ${MOCK_KPI.hired.value}`} className="bg-surface-card p-base rounded-xl shadow-raised flex flex-col justify-between h-36 border border-[#e0e0e0]">
          <div className="flex items-center justify-between">
            <span className="text-body-md-medium text-text-secondary flex items-center gap-xs">
              <span aria-hidden="true" className="material-symbols-outlined text-status-success text-[18px]">verified</span>
              Contratados Este Mes
            </span>
            <span className="text-label-sm text-status-success bg-status-success-bg px-xs py-2xs rounded">Q1 On-track</span>
          </div>
          <div className="flex flex-col gap-2xs mt-auto">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-xs">
                <span className="text-[42px] font-semibold text-text-primary leading-none">{MOCK_KPI.hired.value}</span>
                <span className="text-body-md text-text-secondary">incorporados</span>
              </div>
              <span className="text-label-md text-text-secondary font-medium">
                Meta: {MOCK_KPI.hired.goal} ({hiredPercent}%)
              </span>
            </div>
            <div className="w-full bg-surface-high h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-status-success h-full rounded-full transition-all duration-500"
                style={{ width: `${hiredPercent}%` }}
                role="progressbar"
                aria-valuenow={hiredPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${hiredPercent}% de la meta alcanzada`}
              />
            </div>
          </div>
        </article>
      </section>

      {/* ── CONTENIDO PRINCIPAL (2 columnas) ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">

        {/* Columna izquierda: Procesos activos */}
        <section aria-label="Procesos Activos Recientes" className="lg:col-span-7 flex flex-col gap-md">
          <div className="bg-surface-card rounded-xl p-base shadow-raised border border-[#e0e0e0] flex flex-col gap-base">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm">
              <div className="flex items-center gap-sm">
                <h2 className="text-headline-sm text-text-primary">Procesos Activos Recientes</h2>
                <span className="w-6 h-6 rounded-full bg-[#dbe1ff] text-[#00174c] text-label-sm font-semibold inline-flex items-center justify-center">
                  {filteredProcesses.length}
                </span>
              </div>
              <SearchBar
                placeholder="Filtrar por rol, cliente..."
                value={search}
                onChange={e => setSearch((e.target as HTMLInputElement).value)}
                onClear={() => setSearch('')}
                className="w-48 sm:w-56"
              />
            </div>

            {/* Lista de procesos */}
            <ul role="list" className="flex flex-col gap-xs">
              {filteredProcesses.map(process => (
                <li
                  key={process.id}
                  className="row-interactive p-base bg-surface rounded-lg flex flex-col gap-sm"
                  onClick={() => navigate(`/processes/${process.id}`)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ver proceso: ${process.title}`}
                  onKeyDown={e => e.key === 'Enter' && navigate(`/processes/${process.id}`)}
                  style={{ borderRadius: '8px' }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-xs">
                    <div className="flex flex-col min-w-0">
                      <span className="text-title-md text-text-primary">{process.title}</span>
                      <span className="text-body-md text-text-secondary">{process.client}</span>
                    </div>
                    <div className="flex items-center gap-sm flex-shrink-0">
                      <StageChip stage={process.stage} />
                      <span
                        className="text-label-md font-medium flex items-center gap-xs"
                        style={{ color: '#0f62fe', whiteSpace: 'nowrap' }}
                      >
                        Ver proceso
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-base">
                      <span className="flex items-center gap-xs text-body-md text-text-secondary">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        {process.candidates} candidatos
                      </span>
                      <AvatarGroup avatars={[...process.referents]} size="sm" max={3} />
                    </div>
                    <span className="text-label-md text-text-secondary">
                      {process.daysOpen}d abierto
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Columna derecha: Entrevistas del día */}
        <section aria-label="Entrevistas del Día" className="lg:col-span-5 flex flex-col gap-md">
          <div className="bg-surface-card rounded-xl p-base shadow-raised border border-[#e0e0e0] flex flex-col gap-base">
            <div className="flex items-center justify-between">
              <h2 className="text-headline-sm text-text-primary">Entrevistas del Día</h2>
              <button
                type="button"
                className="text-label-md text-primary-interactive hover:underline"
                onClick={() => navigate('/interviews')}
              >
                Ver todas
              </button>
            </div>

            <ul role="list" className="flex flex-col gap-xs">
              {MOCK_INTERVIEWS.map(interview => (
                <li
                  key={interview.id}
                  className="row-interactive p-sm bg-surface rounded-lg flex items-center justify-between gap-sm"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-body-md-medium text-text-primary truncate">{interview.candidate}</span>
                    <span className="text-label-md text-text-secondary truncate">{interview.role}</span>
                  </div>
                  <div className="flex items-center gap-sm flex-shrink-0">
                    <span className="text-body-md text-text-secondary">{interview.time}</span>
                    <StageChip stage={interview.stage} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

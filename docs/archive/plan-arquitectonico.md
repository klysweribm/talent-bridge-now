> **ARCHIVADO (2026-09-13)** — su backlog fue migrado a [`ROADMAP.md`](../../ROADMAP.md)
> (features `PROC-2`, `INT-1`, `FEED-1`, `REP-1`, `CV-1`, `DEPLOY-1`). Se conserva
> solo como referencia histórica de la estrategia original de 4 semanas.

# 🚀 Estrategia para MVP en Tiempo Récord

---

## Primero — Entendamos dónde estás parado

```
✅ YA TIENES:
├── Monorepo levantando (Docker + npm)
├── Diseño completo (Stitch) — Login + Dashboard + Wizard
├── Componente Login implementado
├── Primer Dashboard principal
├── Estructura hexagonal backend andamiada
├── Shared types, utils, email templates
├── BEST_PRACTICES.md definido
├── Feature slices + Atomic Design + Zustand + React Query
└── PROJECT_CONTEXT.md como fuente de verdad

❌ AÚN FALTA (lo crítico del MVP):
├── Backend: endpoints reales funcionando
├── Auth: JWT real end-to-end
├── Flujo 1: Crear proceso + asignar referente
├── Flujo 2: Calendario + agendar entrevista
├── Flujo 3: Feedback post-entrevista
├── Integración IBM Cloud (Mongo, Redis, Watson, COS)
└── Deploy real en IBM Cloud
```

---

## La pregunta real: ¿Frontend primero o Paralelo?

```
╔══════════════════════════════════════════════════════════════╗
║  OPCIÓN A: TODO FRONTEND CON MOCKS → LUEGO BACKEND          ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Semana 1-2: Frontend completo con MSW / json mocks          ║
║  Semana 3-4: Backend + integración                           ║
║                                                              ║
║  ✅ PROS:                                                    ║
║  → Demo visual lista rápido                                  ║
║  → Puedes mostrar UI completa antes del backend             ║
║  → Agente frontend trabaja sin bloqueos                     ║
║                                                              ║
║  ❌ CONTRAS PARA TU CASO:                                    ║
║  → Semana 3 y 4 son las más críticas y las más cargadas     ║
║  → Integrar mock → real introduce bugs de último momento    ║
║  → Si la demo es interactiva necesitas backend real         ║
║  → El tiempo de integración siempre se subestima            ║
║  → Riesgo alto de no tener deploy funcional a tiempo        ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  OPCIÓN B: FEATURE COMPLETO POR FEATURE (VERTICAL)          ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Por cada feature: Backend endpoint → Frontend consume      ║
║  Feature 1 completo → Feature 2 completo → etc.             ║
║                                                              ║
║  ✅ PROS:                                                    ║
║  → Cada feature queda funcional end-to-end                  ║
║  → Puedes hacer demo parcial en cualquier momento           ║
║  → Sin sorpresas de integración al final                    ║
║  → Deploy incremental, siempre algo funciona                ║
║  → Los agentes tienen contexto acotado por feature          ║
║                                                              ║
║  ❌ CONTRAS:                                                  ║
║  → Requiere más coordinación entre front y back             ║
║  → Más cambios de contexto para el agente                   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## ✅ Mi recomendación: Enfoque Híbrido en 4 Semanas

```
LA CLAVE ES ESTA REGLA:
─────────────────────────────────────────────────────────────
No construyas UI que no puedas conectar en esa misma semana.
Cada viernes debe existir algo funcionando end-to-end.
─────────────────────────────────────────────────────────────
```

---

## 📅 Plan de 4 Semanas — Feature-Driven Vertical

```
╠══════════════════════════════════════════════════════════════════╣
║  SEMANA 2 — PROCESOS + CANDIDATOS (continuación)                ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  MIÉRCOLES - JUEVES (continuación)                               ║
║  Frontend:                                                       ║
║  ├── Wizard Crear Proceso:                                       ║
║  │   ├── Paso 1: Información del rol → guarda en backend        ║
║  │   ├── Paso 2: Buscar y asignar referentes → GET /users/      ║
║  │   │          referents con filtros por especialidad          ║
║  │   ├── Paso 3: Cargar candidato → POST /candidates            ║
║  │   │          con validación de duplicado (check por email)   ║
║  │   └── Paso 4: Confirmar → PATCH /processes/:id              ║
║  ├── Banco de perfiles (Reclutador + PM)                        ║
║  └── Detalle de candidato                                        ║
║                                                                  ║
║  VIERNES                                                         ║
║  ✅ CHECKPOINT: Se puede crear un proceso completo end-to-end   ║
║  ✅ Candidatos se crean, valida duplicados                       ║
║  ✅ Referentes se listan y asignan al proceso                   ║
║  ✅ Dashboard muestra datos reales                               ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  SEMANA 3 — CALENDARIO + ENTREVISTAS + NOTIFICACIONES           ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  LUNES - MARTES                                                  ║
║  Backend:                                                        ║
║  ├── capability/interviews                                       ║
║  │   ├── POST /availability (referente carga sus bloques)       ║
║  │   ├── GET /availability/:referentId (ver disponibilidad)     ║
║  │   ├── POST /interviews (reclutador agenda entrevista)        ║
║  │   ├── PATCH /interviews/:id/confirm (referente confirma)     ║
║  │   ├── PATCH /interviews/:id/reschedule (sugiere otro hora)   ║
║  │   └── GET /interviews/:id/ics (genera archivo .ics)          ║
║  ├── capability/notifications                                    ║
║  │   ├── Email al referente cuando se agenda entrevista         ║
║  │   │   (IBM Event Notifications HTTP API)                     ║
║  │   ├── Email de confirmación al reclutador                    ║
║  │   └── Webhook Slack cuando referente no tiene disponibilidad ║
║  └── Redis → cache de disponibilidad por referente              ║
║                                                                  ║
║  MIÉRCOLES - JUEVES                                              ║
║  Frontend:                                                       ║
║  ├── Dashboard Referente Técnico:                               ║
║  │   ├── Cargar disponibilidad                                   ║
║  │   │   ├── Vista matriz (calendario semanal)                  ║
║  │   │   ├── Vista lista de horarios                            ║
║  │   │   ├── Toggle bloque mañana / tarde completo             ║
║  │   │   └── Selección custom dentro del bloque                ║
║  │   ├── Lista de solicitudes pendientes de aprobación          ║
║  │   ├── Botón confirmar / sugerir nuevo horario                ║
║  │   └── Mis estadísticas (procesos, contratados)               ║
║  ├── Feature Calendario Reclutador:                             ║
║  │   ├── Búsqueda de referente + ver disponibilidad             ║
║  │   ├── Seleccionar horario disponible                         ║
║  │   ├── Botón "Descargar .ics" post-agendamiento              ║
║  │   └── Fallback: "Solicitar por Slack" si sin disponibilidad  ║
║  └── Timezone del referente visible en todos los componentes    ║
║                                                                  ║
║  VIERNES                                                         ║
║  ✅ CHECKPOINT: Flujo completo de entrevista funciona           ║
║  ✅ Reclutador agenda → Referente recibe email → Confirma       ║
║  ✅ .ics se descarga correctamente                               ║
║  ✅ Slack webhook funciona para caso sin disponibilidad         ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  SEMANA 4 — FEEDBACK + REPORTES + CV IA + DEPLOY               ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  LUNES                                                           ║
║  Backend:                                                        ║
║  ├── capability/feedback                                         ║
║  │   ├── POST /feedback (referente llena post-entrevista)       ║
║  │   ├── GET /feedback/:processId (reclutador ve resultados)    ║
║  │   └── POST /feedback/:id/send-email (envío al candidato)     ║
║  └── capability/cv-analysis                                      ║
║      ├── POST /cv/upload (sube PDF/WORD a IBM COS)              ║
║      └── POST /cv/analyze (Watson NLU extrae datos)             ║
║                                                                  ║
║  MARTES                                                          ║
║  Backend:                                                        ║
║  ├── capability/reports                                          ║
║  │   ├── GET /reports/:processId/candidate/:id (genera PDF)     ║
║  │   └── POST /reports/:id/send (envía por correo al cliente)   ║
║  └── IBM COS → bucket CVs configurado y funcional               ║
║                                                                  ║
║  MIÉRCOLES                                                       ║
║  Frontend:                                                       ║
║  ├── Feature Feedback (Referente):                              ║
║  │   ├── Template sugerido por IA según perfil del rol          ║
║  │   ├── Dimensiones evaluadas (técnico + soft skills)          ║
║  │   ├── Score 1-5 por dimensión                                ║
║  │   └── Recomendación final (avanza / no avanza / hold)        ║
║  ├── Feature Carga CV (Reclutador):                             ║
║  │   ├── Upload PDF/WORD                                         ║
║  │   ├── Spinner análisis Watson NLU                            ║
║  │   └── Pre-llenado automático del perfil candidato            ║
║  └── Feature Reportes:                                           ║
║      ├── Botón "Generar PDF" por candidato                      ║
║      └── Botón "Enviar al cliente"
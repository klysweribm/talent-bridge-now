# IBM Talent Bridge — Contexto del Proyecto

> **Versión:** 1.0 MVP  
> **Última actualización:** 2025  
> **Stack:** React + NestJS + IBM Cloud  
> **Audiencia:** Agentes IA y desarrolladores del equipo

---

## ¿Qué es IBM Talent Bridge?

Plataforma centralizada de coordinación del proceso de selección para **IBM Consulting LatAm**.  
Conecta Reclutadores, Referentes Técnicos y PMs para gestionar entrevistas, candidatos, feedback con IA y reportes al cliente.

Es una SPA (Single Page Application) con autenticación por roles, agendamiento de entrevistas con calendario interactivo, análisis de CVs con watsonx.ai, y generación de reportes PDF para clientes.

---

## Roles del MVP

| Rol | Responsabilidad principal |
|-----|--------------------------|
| **Reclutador** | Crea procesos, busca referentes, sube CVs, agenda entrevistas, genera reportes |
| **Referente Técnico** | Carga disponibilidad, aprueba citas, llena feedback post-entrevista |
| **PM** | Vista ejecutiva de lectura, descarga reportes |

> ⚠️ El **Candidato NO tiene acceso** en el MVP. El reclutador envía feedback manual por correo.

---

## Etapas de un Proceso de Selección

```
Inicial → 1ra Entrevista → Entrevista Técnica → Entrevista con Cliente → Cierre → Retroalimentación
```

Cada etapa tiene un estado (`pending`, `in_progress`, `completed`, `cancelled`) y puede configurarse por proceso.

---

## Decisiones Clave Confirmadas

### 📅 Calendario y Agendamiento
- ✅ **Bloques horarios:** Mañana 9am–1pm / Tarde 2pm–6pm (+ custom dentro del bloque)
- ✅ **Duración entrevistas:** 30 / 45 / 60 / 90 min (configurable por proceso)
- ✅ **Mínimo 2 referentes por proceso:** Técnico Principal + Validador
- ✅ **Timezone del referente** siempre visible en componentes de calendario
- ✅ **Exportación `.ics`** para importar cita en calendario (Outlook / Google / IBM)

### 👤 Candidatos
- ✅ Un candidato puede estar en **N procesos simultáneos**
- ✅ **Candidato identificado por correo** como campo único
- ✅ **Validación de duplicado** antes de crear perfil en BD
- ✅ **Banco de perfiles:** solo Reclutador y PM tienen acceso

### 🔐 Autenticación
- ✅ **MVP:** `AUTH-1` dev-login (JWT sobre usuarios sembrados, deshabilitado si `NODE_ENV=production`) → `AUTH-2` reemplaza la emisión con OTP real por correo (Mongo TTL + `EmailSenderPort`)
- ✅ **Fase 2:** SSO corporativo (w3id) — proveedor a confirmar: IBM App ID está en camino de reemplazo por IBM Security Verify, verificar antes de implementar

### 📊 Feedback y Reportes
- ✅ **Feedback visible** solo para Reclutador y PM (internamente)
- ✅ **Reporte:** PDF descargable + envío por correo desde la plataforma
- ✅ **Correo plantilla:** HTML plano sin scripts (compatible sistemas corporativos IBM)

---

## Stack Técnico Final

| Capa | Tecnología | Infraestructura | Propósito |
|------|-----------|-----------------|-----------|
| **Frontend** | React + Vite + TypeScript | Objetivo, no implementado: IBM Code Engine (nginx, SPA + proxy `/api`) | SPA con roles |
| **Backend** | NestJS + Arquitectura Hexagonal | Objetivo, no implementado: IBM Code Engine (Docker, `project-only`) | API REST |
| **Base de Datos** | MongoDB | Objetivo, no implementado: Databases for MongoDB (`br-sao`) | Colecciones flexibles + TTL para OTP |
| **Email** | `EmailSenderPort` + adapter SMTP | Relay SMTP corporativo (a validar) | OTP, invitaciones, feedback, reportes |
| **IA CV** | watsonx.ai (`CvAnalysisPort`) | API watsonx.ai (región a validar) | Extracción de datos de CV |
| **Storage** | IBM Cloud Object Storage | COS (`br-sao`) | PDFs y WORD de CVs |
| **Auth** | JWT (dev-login MVP → OTP) | IBM Cloud | Roles + tokens — SSO Fase 2 |
| **Slack** | Incoming Webhooks | Slack API | Notificaciones sin disponibilidad (si se retoma en `INT-1`) |
| **Calendario** | ical.js (.ics generation) | Client-side | Importable en cualquier cliente |

> No hay Redis en el MVP (ver ADR-008 en `docs/architecture/README.md`): OTP hasheado en MongoDB con índice TTL, rate limiting con el throttler en memoria de NestJS.

---

## Estructura del Monorepo

```
ibm-talent-bridge/
│
├── apps/
│   ├── frontend/          ← React + Vite + TypeScript
│   └── backend/           ← NestJS + Arquitectura Hexagonal
│
├── packages/
│   ├── shared-types/      ← Interfaces y tipos compartidos (TS)
│   ├── shared-utils/      ← Utilidades comunes (formatters, validators)
│   └── email-templates/   ← Templates HTML de correos (sin scripts)
│
├── docs/
│   ├── architecture/      ← ADRs y diagramas Mermaid (C1, C2 y despliegue objetivo)
│   ├── design/            ← UX-GUIDELINES.md (fuente única de UX del MVP; manda sobre cualquier mockup)
│   ├── api/               ← Documentación Swagger exportada
│   ├── flows/             ← Flujos de usuario documentados
│   ├── integrations/      ← Notas de integraciones externas
│   └── use-cases/         ← Casos de uso por rol y feature
│
├── DESIGN/                ← Gitignored; solo conserva DESIGN.md (tokens). No es fuente de diseño
├── legacy_docs/           ← Documentación obsoleta, fuera de alcance para agentes
├── good-practices/        ← Convenciones, validate-quality.mjs y DEBT_TECH.md
│
├── .github/
│   └── workflows/         ← CI/CD pipelines (GitHub Actions)
│
├── docker-compose.yml     ← Para desarrollo local completo
├── docker-compose.test.yml← Para tests de integración
├── .env.example           ← Variables de entorno documentadas
├── ROADMAP.md             ← Backlog de features (estado, prioridad, dependencias)
├── PROJECT_CONTEXT.md     ← Este archivo (contexto general del proyecto)
└── README.md              ← Documentación principal del proyecto
```

> No hay `package.json` en la raíz ni Turborepo: cada app y cada `packages/*` es un proyecto npm independiente.

---

## Arquitectura Backend — Hexagonal + DDD + Vertical Slice

```
src/
├── capabilities/            # Cada capability = 1 bounded context (vertical slice)
│   ├── auth/
│   ├── candidates/
│   ├── processes/
│   ├── interviews/
│   ├── feedback/
│   ├── reports/
│   └── notifications/
│       ├── application/
│       │   ├── ports/       # Interfaces de entrada/salida
│       │   └── services/    # Casos de uso, orquestan lógica de dominio
│       ├── domain/
│       │   ├── dto/         # DTOs validados (class-validator)
│       │   └── interfaces/  # Contratos de dominio, value objects, entidades
│       └── infrastructure/
│           ├── adapters/    # Implementan puertos de salida (DB, HTTP, colas)
│           └── controllers/ # Entry points REST (thin, solo mapean HTTP → caso de uso)
│
├── shared/                  # Guards, interceptors, decorators, utils transversales
├── monitoring/              # Health checks, métricas, tracing
└── main.ts
```

### Reglas de Capas (no negociables)
- **Controllers** → solo llaman Application Services (nunca dominio directamente)
- **Application Services** → usan Ports (nunca importan adapters directamente)
- **Adapters** → implementan interfaces de Port (inversión de dependencias)
- **Domain** → CERO dependencias externas. TypeScript puro.

---

## Capabilities del Backend (Bounded Contexts)

| Capability | Responsabilidad |
|-----------|-----------------|
| `auth` | JWT, dev-login (MVP) / OTP (`AUTH-2`), refresh token, roles, SSO (Fase 2 — proveedor a confirmar) |
| `candidates` | CRUD candidatos, validación duplicados, banco de perfiles |
| `processes` | Procesos de selección, etapas, asignación de referentes |
| `interviews` | Agendamiento, disponibilidad, bloques horarios, exportación .ics |
| `feedback` | Templates, llenado post-entrevista, visibilidad por rol |
| `reports` | Generación PDF, envío por correo, historial |
| `notifications` | Email (`EmailSenderPort` + adapter SMTP), Slack Webhooks |
| `cv-analysis` | Upload a COS, análisis con watsonx.ai (`CvAnalysisPort`), extracción de datos |

---

## Arquitectura Frontend — Feature Slices

```
src/
├── features/
│   ├── auth/
│   ├── candidates/
│   ├── processes/
│   ├── interviews/
│   ├── feedback/
│   └── reports/
│       ├── components/     # Componentes React del feature
│       ├── hooks/          # Custom hooks del feature
│       ├── services/       # Llamadas HTTP al backend
│       ├── store/          # Estado (Zustand / React Query)
│       └── types/          # Tipos del feature (extienden shared-types)
│
├── shared/
│   ├── components/         # UI components reutilizables (Button, Modal, Table...)
│   ├── hooks/              # Hooks genéricos (useDebounce, usePagination...)
│   ├── layouts/            # Layouts por rol (RecruiterLayout, TechLayout, PMLayout)
│   └── utils/              # Formatters, validators, helpers
│
├── router/                 # React Router + guards por rol
├── config/                 # Variables de entorno, constantes
└── main.tsx
```

---

## Modelos de Datos Principales

> Fuente de verdad del **tipo**: `packages/shared-types/src/index.ts` (consumido por frontend y backend). El modelo debajo es la misma forma, en notación Mongo (`_id: ObjectId`, `Date`); `shared-types` serializa esos mismos campos como `id: string`/`*Id: string` y fechas ISO `string` — es una diferencia de serialización, no un modelo distinto. Decisiones de embeber vs. referenciar, consistencia entre agregados e índices: ver **ADR-013** en `docs/architecture/README.md`.

### Candidate
```typescript
{
  _id: ObjectId,
  email: string,           // Campo único (identificador)
  fullName: string,
  phone?: string,
  linkedIn?: string,
  cvUrl: string,           // URL en IBM COS
  cvAnalysis?: CvAnalysisResult,  // resultado del CvAnalysisPort (watsonx.ai)
  processIds: ProcessId[], // Procesos en los que participa — mantenido en sync con Process.candidateIds (ADR-013)
  createdAt: Date,
  updatedAt: Date
}
```

### Process
```typescript
{
  _id: ObjectId,
  title: string,
  clientName: string,
  recruiterId: UserId,
  technicalRefs: { userId: UserId, roleInProcess: 'principal' | 'validador' }[], // Mínimo 1 de cada rol — embebido, ADR-013
  candidateIds: CandidateId[],       // Referencia — Candidate tiene vida propia
  currentStage: Stage,
  stageHistory: StageHistoryEntry[], // Embebido, append-only
  interviewDuration: 30 | 45 | 60 | 90, // minutos
  requiredTechnologies: string[],
  seniority: 'junior' | 'mid' | 'senior' | 'lead' | 'architect',
  profileDescription?: string,
  clientExpectations?: string,
  status: 'active' | 'paused' | 'closed',
  createdAt: Date,
  updatedAt: Date
}
```

`StageHistoryEntry`:
```typescript
{
  stage: Stage,
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled', // ver semántica exacta en ADR-013
  changedAt: Date,
  changedBy: UserId
}
```

### Interview
```typescript
{
  _id: ObjectId,
  processId: ProcessId,
  candidateId: CandidateId,
  referentId: UserId,
  scheduledAt: Date,
  duration: number,         // minutos
  timezone: string,         // timezone del referente
  block: 'morning' | 'afternoon' | 'custom',
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  icsExported: boolean,
  meetingLink?: string,
  rescheduleHistory?: { previousScheduledAt: Date, changedAt: Date, changedBy: UserId }[], // embebido, append-only — ADR-013
  createdAt: Date
}
```

### Feedback

> Relación 1:1:1 — un feedback por entrevista, candidato y proceso (todas las FK son escalares, nunca arrays; hoy no se considera más de un referente por entrevista). Índice único en `interviewId` para forzarlo también en la base. **Sin campo `visibleTo`**: la visibilidad (escribe solo el referente autor; leen reclutador/PM del proceso) es una regla de autorización estática aplicada en código, no un dato persistido — ver ADR-013.

```typescript
{
  _id: ObjectId,
  interviewId: InterviewId,  // único — un feedback por entrevista
  referentId: UserId,
  candidateId: CandidateId,
  processId: ProcessId,
  technicalScore: 1 | 2 | 3 | 4 | 5,
  softSkillsScore: 1 | 2 | 3 | 4 | 5,
  recommendation: 'advance' | 'reject' | 'hold',
  comments: string,
  aiSuggestedTemplate?: string,
  createdAt: Date
}
```

### Report

> Nueva entidad (ADR-013) — no existía antes aunque `REP-1` ya definía sus endpoints.

```typescript
{
  _id: ObjectId,
  processId: ProcessId,
  candidateId: CandidateId,
  generatedBy: UserId,       // recruiterId
  generatedAt: Date,
  pdfUrl: string,            // IBM COS
  sentHistory: { sentAt: Date, sentBy: UserId, sentTo: string }[], // embebido, append-only — cardinalidad de sentTo abierta, ver REP-1 en legacy (encuadre anterior; revisar en el replanning)
  createdAt: Date
}
```

---

## Variables de Entorno Requeridas

> Las integraciones externas (watsonx.ai, COS, SMTP, App ID, Slack) y `JWT_REFRESH_EXPIRATION` están **reservadas (se añaden junto a su adapter)**: hoy ningún código las lee y no figuran en `.env.example` ni en los compose.

```env
# App
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Auth
JWT_SECRET=
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d  # reservada (AUTH-3)

# MongoDB (Databases for MongoDB, br-sao)
MONGODB_URI=

# [reservadas] watsonx.ai (análisis de CV — CvAnalysisPort)
WATSONX_URL=
WATSONX_PROJECT_ID=
WATSONX_API_KEY=
WATSONX_MODEL_ID=

# [reservadas] IBM Cloud Object Storage (br-sao)
COS_ENDPOINT=
COS_API_KEY=
COS_INSTANCE_CRN=
COS_BUCKET_CVS=

# [reservadas] SMTP (EmailSenderPort — OTP, invitaciones, feedback, reportes)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

# [reservadas] IBM App ID (Fase 2 — en camino de reemplazo por IBM Security Verify, verificar antes de usar)
APPID_TENANT_ID=
APPID_CLIENT_ID=
APPID_SECRET=
APPID_OAUTH_SERVER_URL=

# [reservadas] Slack
SLACK_WEBHOOK_URL=
```

> Sin Redis en el MVP (ver ADR-008 en `docs/architecture/README.md`).

---

## Principios de Desarrollo

1. **Construir simple, modular, limpio y escalable**
2. Cada feature debe poder probarse de forma aislada
3. Cada módulo debe poder separarse a microservicio en el futuro
4. **No sobre-ingeniería:** MVP funcional primero, perfección después
5. No usar `any` en TypeScript — usar `unknown` + type guards
6. DTOs con `class-validator` en backend
7. Tests unitarios obligatorios (Jest + @nestjs/testing)

---

## Roadmap MVP → Fase 2

| MVP (v1.0) | Fase 2 |
|-----------|--------|
| Auth dev-login → OTP | SSO corporativo (w3id / IBM Security Verify, a confirmar) |
| Candidato sin acceso | Portal candidato |
| Slack webhook básico | Slack App completa |
| PDF manual | Dashboard Analytics |
| watsonx.ai básico | Scoring automático de candidatos |

---

## Guía Rápida para el Agente IA

> Cuando recibas una tarea de implementación sobre este proyecto, sigue este orden:
> 
> 1. **Leer** este archivo `PROJECT_CONTEXT.md` completo
> 2. **Identificar** el capability afectado (auth, candidates, processes, etc.)
> 3. **Respetar** la arquitectura Hexagonal: Domain → Application → Infrastructure
> 4. **No modificar** código existente sin que se pida explícitamente
> 5. **Generar tests** unitarios para todo código nuevo
> 6. **Reportar** en el resumen: qué hiciste, qué archivos tocaste, por qué

---

*Este documento se actualiza a medida que se toman nuevas decisiones técnicas o de producto.*

---

## Sistema de Diseño

> **La fuente de UX es `docs/design/UX-GUIDELINES.md`**; donde contradiga a un mockup, manda ese documento. Los mockups de Stitch eran solo referencia visual y ya no están en el repo (se movieron a `legacy_docs/`, fuera de alcance); `DESIGN/` conserva únicamente `DESIGN.md`, de donde salen los tokens de abajo.

### Pantallas

La especificación de cada pantalla (Login, Inicio, Lista de procesos, Wizard, Detalle, Feedback) está en `docs/design/UX-GUIDELINES.md` §3. Los mockups que antes se listaban aquí ya no están en el repo.

---

### Paleta de Colores (Design Tokens)

```
Primary:               #003099  (IBM Blue 80)
Primary Container:     #0043CE  (IBM Blue 70) — headers, nav activo
Interactive/Accent:    #0F62FE  (IBM Blue 60) — botones primarios, focus, links
Secondary Container:   #0F62FE  — igual que interactive accent
Secondary Fixed:       #DBE1FF  — badges, chips de info
On Primary:            #FFFFFF
On Secondary:          #FFFFFF

Surface:               #F9F9F9  — canvas de página
Surface Card:          #FFFFFF  — cards, modales, tablas
Surface Container Low: #F3F3F3
Surface Container:     #EEEEEE
Surface Container High:#E8E8E8
Surface Container Highest: #E2E2E2

Text Primary:          #161616  (Gray 100)
Text Secondary:        #525252  (Gray 70)
Outline:               #747686
Outline Variant:       #C4C5D7

Status Success:        #24A148
Status Warning:        #F1C21B
Status Danger:         #DA1E28

Background chip Success: #DEFBE6 / text #24A148
Background chip Warning: #FEF3D6 / text #8A6100
Background chip Danger:  #FFEBEB / text #DA1E28
Background chip Info:    #EDF5FF / text #0043CE
Background chip Tech:    #F3E8FF / text #6B21A8  (Entrev. Técnica)
Background chip Client:  #FFEDD5 / text #9A3412  (C/Cliente)
Background chip Stage1:  #DBEAFE / text #1E40AF  (1ra Entrevista)
```

### Tipografía

Fuente exclusiva: **IBM Plex Sans** (pesos: 400, 500, 600)

| Token | Tamaño | Peso | Line-height |
|-------|--------|------|-------------|
| `display-xl` | 42px | 600 | 50px |
| `headline-lg` | 32px | 600 | 40px |
| `headline-md` | 24px | 500 | 30px |
| `headline-sm` | 20px | 600 | 26px |
| `title-md` | 16px | 600 | 22px |
| `body-lg` | 16px | 400 | 24px |
| `body-md` | 14px | 400 | 20px |
| `body-md-medium` | 14px | 500 | 20px |
| `label-md` | 12px | 500 | 16px |
| `label-sm` | 11px | 400 | 14px |

### Espaciado (Base 8px)

```
space-2xs:  2px   (0.125rem)
space-xs:   4px   (0.25rem)
space-sm:   8px   (0.5rem)
space-md:   12px  (0.75rem)
space-base: 16px  (1rem)
space-lg:   24px  (1.5rem)
space-xl:   32px  (2rem)
space-2xl:  48px  (3rem)
space-3xl:  64px  (4rem)
```

### Border Radius

```
sm:   2px    (0.125rem)
DEFAULT: 4px (0.25rem)  — botones, inputs, badges
md:   6px    (0.375rem)
lg:   8px    (0.5rem)   — cards, modales
xl:   12px   (0.75rem)
full: 9999px             — avatares, indicadores de estado
```

### Componentes Clave del Diseño

#### Botones
- **Primary:** bg `#0F62FE`, text `#FFF`, h-10 (40px), rounded-lg (4px), `body-md-medium`
  - Hover: `#0043CE` | Active: `#002D9C`
- **Secondary:** border `1px solid #0F62FE`, text `#0F62FE`, bg transparent
  - Hover: bg `#EDF5FF`
- **Ghost:** text `#0F62FE`, sin borde | Hover: bg `#EBEBEB`
- **Danger:** bg `#DA1E28`, text `#FFF` | Hover: `#BA1B23`

#### Inputs & Search Fields
- h-10 (40px), rounded-lg (4px), bg `#FFFFFF`
- Border: `1px solid #8D8D8D` resting | Focus: `2px solid #0F62FE`
- Error: `2px solid #DA1E28`
- Text: `#161616` / Placeholder: `#A8A8A8`

#### Cards
- bg `#FFFFFF`, border-radius 8px (`rounded-xl`), `1px solid #E0E0E0`
- Padding interior: 16px o 24px según densidad
- Hover en cards clicables: border-color → `#0F62FE`

#### Status Chips / Etapas del Proceso
| Estado | bg | texto |
|--------|-----|-------|
| Inicial | `#E2E2E2` | `#434655` |
| 1ra Entrevista | `#DBEAFE` | `#1E40AF` |
| Entrev. Técnica | `#F3E8FF` | `#6B21A8` |
| C/Cliente | `#FFEDD5` | `#9A3412` |
| Cierre | `#DEFBE6` | `#24A148` |
| Rechazado | `#FFEBEB` | `#DA1E28` |

#### Elevación / Sombras
- **Level 0** (canvas): bg `#F4F4F4`, sin sombra
- **Level 1** (cards): bg `#FFF`, `1px solid #E0E0E0`, `shadow-sm`
- **Level 2** (dropdowns/popovers): `1px solid #8D8D8D`, `0 4px 8px rgba(0,0,0,0.10)`
- **Level 3** (modales): scrim `rgba(22,22,22,0.50)`, `0 12px 24px rgba(0,0,0,0.16)`

---

### Estructura de Pantallas Identificadas

#### 1. Login (`/login`)
- Card centrada, máx. 480px
- Logo IBM + "Talent Bridge" en header
- Campos: correo corporativo (`@ibm.com`) + contraseña con toggle
- Checkbox "recordar 30 días"
- Botón "Iniciar Sesión" (primary)
- Separador + botón "Acceder con IBM w3id SSO" (secondary)
- Footer: TLS badge + links legales

#### 2. Dashboard Reclutador (`/dashboard`)
- Sidebar de navegación (izquierda, fijo)
- Header con nombre de usuario y avatar
- 4 KPI Cards horizontales: Procesos Activos · Candidatos en Proceso · Entrevistas Esta Semana · Contratados Este Mes
- Panel izquierdo (60%): lista de procesos activos con etapa, referentes y acciones rápidas
- Panel derecho (40%): próximas entrevistas + actividad reciente

#### 3. Crear Proceso (`/processes/new`) — Wizard 4 pasos
- **Paso 1 — Información del Rol:** Nombre proceso, cliente, seniority (5 niveles), descripción, expectativas cliente, duración entrevista (30/45/60/90min), tecnologías requeridas (tags), métricas benchmark
- **Paso 2 — Asignar Referentes:** Buscador + chips de filtro por especialidad, cards de referente con disponibilidad, historial de éxito, botón asignar
- **Paso 3 — Cargar Candidatos:** (pendiente de diseño)
- **Paso 4 — Confirmar y Publicar:** (pendiente de diseño)

---

### Convenciones de implementación extraídas del diseño

1. **Tailwind CSS** como sistema de utilidades — tokens mapeados como colores custom en `tailwind.config`
2. **Material Symbols Outlined** para iconografía (Google Fonts, `text-[NNpx]` para tamaño)
3. **IBM Plex Sans** via Google Fonts (`wght@400;500;600;700`)
4. Sidebar navigation con íconos + labels — siempre visible en desktop, colapsable en mobile
5. Todas las tablas/listas: row height 48px compact / 56px standard, dividers `1px solid #E0E0E0`
6. Timezone del referente siempre visible en cualquier componente de calendario
7. Los chips de etapa usan colores específicos por fase (ver tabla Status Chips arriba)
8. Avatar: `rounded-full`, tamaños estándar `w-6 h-6` (24px inline) / `w-12 h-12` (48px en cards)


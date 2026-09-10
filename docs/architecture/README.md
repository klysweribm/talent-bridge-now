# Arquitectura — IBM Talent Bridge

## Visión General

IBM Talent Bridge sigue una arquitectura de **monorepo con vertical slices**. El backend usa **Arquitectura Hexagonal + DDD**, el frontend usa **Feature Slices**.

## Diagrama C4 — Contexto del Sistema

```
┌──────────────────────────────────────────────────────────────────────┐
│                        IBM Consulting LatAm                          │
│                                                                      │
│  [Reclutador]  [Referente Técnico]  [PM]                            │
│       │               │               │                              │
│       └───────────────┴───────────────┘                              │
│                       │                                              │
│              ┌────────▼────────┐                                     │
│              │  IBM Talent     │                                     │
│              │  Bridge (SPA)   │                                     │
│              └────────┬────────┘                                     │
│                       │ HTTPS / REST                                 │
│              ┌────────▼────────┐                                     │
│              │  Backend API    │◄──── IBM Watson NLU                 │
│              │  (NestJS)       │◄──── IBM COS (Storage)              │
│              └────────┬────────┘◄──── IBM Event Notifications        │
│                       │         ◄──── Slack Webhooks                 │
│            ┌──────────┼──────────┐                                   │
│            ▼          ▼          ▼                                   │
│        MongoDB      Redis    IBM App ID                              │
│       (IBM Cloud) (IBM Cloud)  (Auth)                                │
└──────────────────────────────────────────────────────────────────────┘
```

## Diagrama C4 — Contenedores

```
┌─────────────────────────────────────────────────────────┐
│                 IBM Talent Bridge                        │
│                                                         │
│  ┌──────────────────────────────────────┐               │
│  │  Frontend (React SPA)                │               │
│  │  React 18 + Vite + TypeScript        │               │
│  │  Deploy: Render Static Site          │               │
│  └────────────────┬─────────────────────┘               │
│                   │ REST API (JSON)                      │
│  ┌────────────────▼─────────────────────┐               │
│  │  Backend API (NestJS)                │               │
│  │  Arquitectura Hexagonal + DDD        │               │
│  │  Deploy: IBM Code Engine (Docker)    │               │
│  └──┬──────┬──────┬────────┬────────────┘               │
│     │      │      │        │                             │
│  MongoDB Redis  COS    Watson NLU                        │
└─────────────────────────────────────────────────────────┘
```

## Arquitectura del Backend — Capas Hexagonales

```
┌─────────────────────────────────────────────────────────┐
│  INFRASTRUCTURE LAYER                                    │
│  ┌─────────────┐  ┌─────────────────────────────────┐   │
│  │ Controllers │  │ Adapters (DB, HTTP, Queue, Cache)│   │
│  │ (REST API)  │  │ MongoDB / Redis / COS / Watson   │   │
│  └──────┬──────┘  └──────────────────┬──────────────┘   │
│         │                            │                   │
│  ┌──────▼────────────────────────────▼──────────────┐   │
│  │  APPLICATION LAYER                                │   │
│  │  ┌─────────────┐   ┌──────────────────────────┐  │   │
│  │  │  Use Cases  │   │  Ports (Interfaces)       │  │   │
│  │  │  (Services) │◄──│  Input / Output           │  │   │
│  │  └──────┬──────┘   └──────────────────────────┘  │   │
│  └─────────┼──────────────────────────────────────────┘  │
│            │                                             │
│  ┌─────────▼──────────────────────────────────────────┐  │
│  │  DOMAIN LAYER (Pure TypeScript — zero deps)        │  │
│  │  Entities · Value Objects · DTOs · Interfaces      │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Capabilities (Bounded Contexts)

| Capability | Bounded Context | Responsabilidad |
|-----------|-----------------|-----------------|
| `auth` | Identidad | JWT, login, roles |
| `candidates` | Talento | CRUD, banco de perfiles, duplicados |
| `processes` | Selección | Wizard, etapas, asignación referentes |
| `interviews` | Agendamiento | Slots, disponibilidad, .ics export |
| `feedback` | Evaluación | Scoring, templates IA, visibilidad |
| `reports` | Reportes | PDF, envío correo, historial |
| `notifications` | Comunicación | IBM Event Notifications, Slack |
| `cv-analysis` | IA | Watson NLU, upload COS |

## Decisiones de Arquitectura (ADRs)

### ADR-001: Monorepo con carpetas separadas
- **Decisión:** Monorepo sin herramienta adicional (sin Turborepo/Nx en MVP)
- **Razón:** Simplicidad. Se puede agregar Turborepo en Fase 2 si el build time lo justifica.
- **Alternativas descartadas:** Polyrepo (más overhead de CI/CD), Nx (curva alta para MVP)

### ADR-002: MongoDB como base de datos principal
- **Decisión:** MongoDB flexible sobre PostgreSQL relacional
- **Razón:** Los procesos de selección tienen estructura variable. Los esquemas evolucionan rápido en MVP.
- **Alternativas descartadas:** PostgreSQL (más rígido para esquemas en evolución)

### ADR-003: Arquitectura Hexagonal + Vertical Slice en backend
- **Decisión:** Cada capability es un slice completo (domain/application/infrastructure)
- **Razón:** Cada capability puede extraerse a microservicio en Fase 2 sin tocar otros módulos.
- **Beneficio:** Testabilidad por capa, inversión de dependencias garantizada.

### ADR-004: Candidato identificado por email
- **Decisión:** El email es el campo único de un candidato.
- **Razón:** Evita duplicados y es el identificador natural en procesos de RRHH.

### ADR-005: Templates de correo como HTML plano sin scripts
- **Decisión:** Todos los correos son HTML inline sin `<script>`, `<link>` ni `@import`.
- **Razón:** Compatibilidad con clientes corporativos IBM (Outlook, Notes, webmail).

# IBM Talent Bridge

> Plataforma centralizada de coordinación de selección de personal para IBM Consulting LatAm.

[![Stack](https://img.shields.io/badge/Stack-React%20%2B%20NestJS%20%2B%20IBM%20Cloud-0F62FE)](.)
[![Arquitectura](https://img.shields.io/badge/Arch-Hexagonal%20%2B%20DDD%20%2B%20Vertical%20Slice-003099)](.)
[![MVP](https://img.shields.io/badge/Estado-MVP%20en%20Construcción-F1C21B)](.)

---

## ¿Qué es esto?

IBM Talent Bridge conecta **Reclutadores, Referentes Técnicos y PMs** en una plataforma web unificada para gestionar procesos de selección end-to-end: desde la creación del proceso hasta el feedback post-entrevista y los reportes al cliente.

**Lee el contexto completo → [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md)**

---

## Estructura del Monorepo

```
ibm-talent-bridge/
├── apps/
│   ├── frontend/          → React + Vite + TypeScript  (Render Static Site)
│   └── backend/           → NestJS + Hexagonal Arch    (IBM Code Engine)
├── packages/
│   ├── shared-types/      → Interfaces y tipos TS compartidos
│   ├── shared-utils/      → Formatters, validators, helpers
│   └── email-templates/   → Templates HTML de correos (sin scripts)
├── docs/
│   ├── architecture/      → Diagramas C4, ADRs
│   ├── api/               → Swagger exportado
│   └── flows/             → Flujos de usuario
├── stitch_ibm_talent_bridge_portal/  → Diseños de referencia (HTML + PNG)
├── docker-compose.yml
├── docker-compose.test.yml
├── .env.example
└── PROJECT_CONTEXT.md     → Fuente de verdad del proyecto
```

---

## Quickstart (Desarrollo Local)

### Pre-requisitos
- Node.js 20+
- Docker + Docker Compose
- Credenciales IBM Cloud (ver `.env.example`)

### Levantar todo con Docker

```bash
cp .env.example .env
# Completar variables en .env

# -----------Levantar todo el stack completo con DOCKER-----------

docker-compose up -d
# ------------------------------------------------------------------

# -----------Levantar todo el stack completo con PODMAN-----------
podman-compose up -d

# O solo la infra (MongoDB + Redis) mientras desarrollas sin Docker
podman-compose up -d mongodb redis
# ------------------------------------------------------------------

```

Servicios disponibles:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Docs (Swagger): http://localhost:3000/api/docs
- MongoDB: localhost:27017
- Redis: localhost:6379

### Desarrollo sin Docker

```bash
# Backend
cd apps/backend
npm install
npm run start:dev

# Frontend (otra terminal)
cd apps/frontend
npm install
npm run dev
```

---

## Roles del Sistema

| Rol | Acceso |
|-----|--------|
| **Reclutador** | CRUD procesos, candidatos, agendamiento, reportes |
| **Referente Técnico** | Disponibilidad, confirmar entrevistas, feedback |
| **PM** | Vista ejecutiva de lectura, descarga de reportes |

---

## Diseños de Referencia

Los mockups están en `stitch_ibm_talent_bridge_portal/`:

| Pantalla | Archivo |
|---------|---------|
| Login | `iniciar_sesi_n_ibm_talent_bridge/screen.png` |
| Dashboard Reclutador | `dashboard_reclutador_ibm_talent_bridge/screen.png` |
| Crear Proceso (Wizard) | `crear_nuevo_proceso_ibm_talent_bridge/screen.png` |
| Sistema de diseño | `ibm_talent_bridge/DESIGN.md` |

---

## Documentación Técnica

- **Contexto completo del proyecto:** [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md)
- **Backend README:** [`apps/backend/README.md`](./apps/backend/README.md)
- **Frontend README:** [`apps/frontend/README.md`](./apps/frontend/README.md)
- **Variables de entorno:** [`.env.example`](./.env.example)

---

## Equipo & Contacto

IBM Consulting LatAm — Plataforma interna. No distribuir externamente.

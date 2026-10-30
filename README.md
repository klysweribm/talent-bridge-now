# IBM Talent Bridge

> Plataforma centralizada de coordinación de selección de personal para IBM Consulting LatAm.

[![Stack](https://img.shields.io/badge/Stack-React%20%2B%20NestJS%20%2B%20IBM%20Cloud-0F62FE)](.)
[![Arquitectura](https://img.shields.io/badge/Arch-Hexagonal%20%2B%20DDD%20%2B%20Vertical%20Slice-003099)](.)
[![MVP](https://img.shields.io/badge/Estado-MVP%20en%20Construcción-F1C21B)](.)

---

## ¿Qué es esto?

IBM Talent Bridge conecta **Reclutadores, Referentes Técnicos y PMs** en una plataforma web unificada para gestionar procesos de selección end-to-end: desde la creación del proceso hasta el feedback post-entrevista y los reportes al cliente.

**Fuentes:** estado y backlog en [`ROADMAP.md`](./ROADMAP.md) · decisiones técnicas en [`docs/architecture/README.md`](./docs/architecture/README.md) · diseño y pantallas en [`docs/design/UX-GUIDELINES.md`](./docs/design/UX-GUIDELINES.md).

---

## Estructura del Monorepo

```
ibm-talent-bridge/
├── apps/
│   ├── frontend/          → React + Vite + TypeScript  (objetivo: IBM Code Engine, nginx — no desplegado)
│   └── backend/           → NestJS + Hexagonal Arch    (objetivo: IBM Code Engine — no desplegado)
├── packages/
│   ├── shared-types/      → Interfaces y tipos TS compartidos
│   ├── shared-utils/      → Formatters, validators, helpers
│   └── email-templates/   → Templates HTML de correos (sin scripts)
├── docs/
│   ├── architecture/      → ADRs y diagramas Mermaid (C1, C2 y despliegue objetivo)
│   ├── design/            → UX-GUIDELINES.md (fuente única de UX del MVP)
│   ├── api/               → Swagger exportado
│   ├── flows/             → Flujos de usuario
│   ├── integrations/      → Notas de integraciones externas (ICA)
│   └── use-cases/         → Casos de uso por rol y feature
├── good-practices/        → Convenciones, validate-quality.mjs y DEBT_TECH.md
├── legacy_docs/           → Fuera de alcance
├── DESIGN/                → Mockups locales (gitignored); no son fuente de diseño
├── docker-compose.yml
├── docker-compose.test.yml
├── .env.example
└── ROADMAP.md             → Estado y backlog de features
```

---

## Quickstart (Desarrollo Local)

> No hay `package.json` en la raíz ni Turborepo: `apps/backend` y `apps/frontend`
> son proyectos npm independientes. No existe `npm start` en la raíz.

### Pre-requisitos
- Node.js 22+ (Node 20 llegó a EOL)
- Podman + podman-compose (o Docker + Docker Compose)

### Configuración (una sola vez)

```bash
cp .env.example .env
# Definir MONGO_INITDB_ROOT_PASSWORD y usar la misma contraseña en MONGODB_URI.
# Para desarrollo local no se necesitan credenciales de IBM Cloud.
(cd apps/backend && npm install)
(cd apps/frontend && npm install)
```

### Opción A — Infra en contenedor, apps en local (recomendado para desarrollar)

```bash
podman-compose up -d mongodb          # o: docker-compose up -d mongodb
cd apps/backend && npm run start:dev  # terminal 1 — lee el .env de la raíz
cd apps/frontend && npm run dev       # terminal 2 — hot reload
```

### Opción B — Todo en contenedores

```bash
podman-compose up -d                  # o: docker-compose up -d
```

### Servicios

| Servicio | URL |
| --- | --- |
| Frontend | http://localhost:5174 (`FRONTEND_PORT`) |
| API | http://localhost:3000/api/v1 — health: `/api/v1/health` |
| Swagger | http://localhost:3000/api/docs |
| MongoDB | localhost:27017 (mongo-express en :8081 con `--profile tools`) |

### Usuarios demo (mock temporal, se reemplaza en AUTH-1)

`ana@ibm.com` (reclutadora) · `carlos@ibm.com` (referente técnico) · `mariana@ibm.com` (PM) — cualquier contraseña de 6+ caracteres.

### Calidad (antes de cada commit)

```bash
(cd apps/frontend && npm run lint && npm run typecheck && npm test -- --run)
(cd apps/backend && npm run lint && npm run typecheck && npm test && npm run test:e2e)
node good-practices/validate-quality.mjs --strict
```

---

## Roles del Sistema

| Rol | Acceso |
|-----|--------|
| **Reclutador** | CRUD procesos, candidatos, agendamiento, reportes |
| **Referente Técnico** | Disponibilidad, confirmar entrevistas, feedback |
| **PM** | Vista ejecutiva de lectura, descarga de reportes |

---

## Diseño

La especificación de UX del MVP es [`docs/design/UX-GUIDELINES.md`](docs/design/UX-GUIDELINES.md): app shell, navegación por rol, alcance de cada pantalla y tokens. `DESIGN/` (gitignored) guarda mockups locales: no son fuente de diseño y nunca se copian como código. Los valores de los tokens salen de `apps/frontend/tailwind.config.ts`.

---

## Documentación Técnica

- **Estado y backlog:** [`ROADMAP.md`](./ROADMAP.md) · **Decisiones técnicas:** [`docs/architecture/README.md`](./docs/architecture/README.md)
- **Backend README:** [`apps/backend/README.md`](./apps/backend/README.md)
- **Frontend README:** [`apps/frontend/README.md`](./apps/frontend/README.md)
- **Variables de entorno:** [`.env.example`](./.env.example)

---

## Equipo & Contacto

IBM Consulting LatAm — Plataforma interna. No distribuir externamente.

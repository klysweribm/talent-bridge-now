# Backend — IBM Talent Bridge

> NestJS + Arquitectura Hexagonal + DDD  
> Deploy: IBM Code Engine (Docker)

## Stack

- **NestJS 10** + **TypeScript 5** (strict)
- **Arquitectura Hexagonal** con **Vertical Slice** por capability
- **Mongoose** — ODM para MongoDB (IBM Cloud)
- **Passport + JWT** — autenticación con roles
- **class-validator + class-transformer** — validación de DTOs
- **Swagger (@nestjs/swagger)** — documentación automática de API
- **Jest + @nestjs/testing** — tests unitarios e integración

## Estructura de Capabilities

```
src/
├── capabilities/
│   ├── auth/            # JWT, login, roles
│   ├── candidates/      # CRUD candidatos, banco de perfiles
│   ├── processes/       # Procesos de selección, etapas
│   ├── interviews/      # Agendamiento, disponibilidad, .ics
│   ├── feedback/        # Templates, scoring, visibilidad
│   ├── reports/         # PDF, envío por correo
│   ├── notifications/   # EmailSenderPort (SMTP), Slack
│   └── cv-analysis/     # watsonx.ai (CvAnalysisPort), upload COS
├── shared/              # Guards, interceptors, decorators
├── monitoring/          # Health checks
└── main.ts
```

## Variables de entorno

Ver [`.env.example`](../../.env.example) en la raíz del monorepo.

## Comandos

```bash
npm install
npm run start:dev     # Desarrollo con hot-reload
npm run start:prod    # Producción
npm run build         # Compilar TypeScript
npm run typecheck     # tsc --noEmit
npm run lint          # ESLint
npm run test          # Jest unitarios
npm run test:e2e      # Tests de integración
npm run test:cov      # Coverage report
```

## API Docs

Con el servidor corriendo, visita: `http://localhost:3000/api/docs` (prefijo
global de API: `/api/v1`).

## Endpoints existentes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/health` | Health check (estado del servicio) |

## Endpoints planeados (ver `ROADMAP.md`)

El resto de `capabilities/` (`auth`, `candidates`, `processes`, `interviews`,
`feedback`, `reports`, `notifications`, `cv-analysis`) todavía no tiene
controllers — son skeleton. Las rutas y su orden de implementación están en
`ROADMAP.md` (`AUTH-1`, `AUTH-2`, `PROC-2`, `CAND-1`, `INT-1`, `FEED-1`,
`REP-1`, `CV-1`); no las documentamos aquí para evitar que esta tabla quede
desincronizada del código — una vez que un endpoint exista, se agrega a la
tabla de arriba.

---

Ver [`ROADMAP.md`](../../ROADMAP.md) para el estado y [`docs/architecture/README.md`](../../docs/architecture/README.md) para las decisiones.

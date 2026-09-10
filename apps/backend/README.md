# Backend — IBM Talent Bridge

> NestJS + Arquitectura Hexagonal + DDD  
> Deploy: IBM Code Engine (Docker)

## Stack

- **NestJS 10** + **TypeScript 5** (strict)
- **Arquitectura Hexagonal** con **Vertical Slice** por capability
- **Mongoose** — ODM para MongoDB (IBM Cloud)
- **ioredis** — cliente Redis (IBM Cloud)
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
│   ├── notifications/   # IBM Event Notifications, Slack
│   └── cv-analysis/     # Watson NLU, upload COS
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

Con el servidor corriendo, visita: `http://localhost:3000/api/docs`

## Endpoints por Capability

### Auth (`/auth`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/login` | Login con correo + password |
| POST | `/auth/refresh` | Renovar access token |
| POST | `/auth/logout` | Invalidar sesión |

### Candidates (`/candidates`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/candidates` | Listar candidatos (paginado) |
| POST | `/candidates` | Crear candidato (valida duplicado por email) |
| GET | `/candidates/:id` | Obtener candidato por ID |
| PATCH | `/candidates/:id` | Actualizar datos del candidato |
| DELETE | `/candidates/:id` | Eliminar candidato |

### Processes (`/processes`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/processes` | Listar procesos activos |
| POST | `/processes` | Crear nuevo proceso |
| GET | `/processes/:id` | Obtener detalle del proceso |
| PATCH | `/processes/:id` | Actualizar proceso |
| POST | `/processes/:id/referents` | Asignar referente técnico |
| DELETE | `/processes/:id/referents/:userId` | Remover referente |

### Interviews (`/interviews`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/interviews` | Crear/agendar entrevista |
| PATCH | `/interviews/:id/confirm` | Confirmar entrevista |
| GET | `/interviews/:id/ics` | Descargar archivo .ics |
| GET | `/interviews/availability/:userId` | Ver disponibilidad de referente |

### Feedback (`/feedback`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/feedback` | Crear feedback post-entrevista |
| GET | `/feedback/:interviewId` | Obtener feedback (Reclutador/PM) |
| GET | `/feedback/template/suggest` | Template sugerido por IA |

### Reports (`/reports`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/reports/generate` | Generar PDF del proceso |
| POST | `/reports/:id/send` | Enviar reporte por correo |
| GET | `/reports/:processId` | Listar reportes del proceso |

---

Ver [`PROJECT_CONTEXT.md`](../../PROJECT_CONTEXT.md) para contexto completo.

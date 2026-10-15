# Frontend — IBM Talent Bridge

> React + Vite + TypeScript  
> Deploy: IBM Code Engine (`apps/frontend/Dockerfile`, nginx; ver ADR-006)

## Stack

- **React 18** + **Vite 5** + **TypeScript 5** (strict)
- **React Router v6** — navegación con guards por rol
- **React Query (TanStack Query)** — fetching, cache y sincronización de estado server
- **Zustand** — estado global ligero (sesión, preferencias UI)
- **React Hook Form + Zod** — formularios con validación tipada
- **Carbon Design System (IBM)** — sistema de diseño oficial IBM
- **ical.js** — generación de archivos `.ics` para exportar entrevistas

## Estructura

```
src/
├── features/
│   ├── auth/
│   ├── candidates/
│   ├── processes/
│   ├── interviews/
│   ├── feedback/
│   └── reports/
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── layouts/
│   └── utils/
├── router/
├── config/
└── main.tsx
```

## Variables de entorno

Ver [`.env.example`](../../.env.example) en la raíz del monorepo. Resumen:

```env
VITE_API_URL=/api/v1   # relativo: el proxy de Vite (ver vite.config.ts) reenvía /api al backend
VITE_APP_ENV=development
```

## Comandos

```bash
npm install
npm run dev       # Servidor de desarrollo
npm run build     # Build de producción
npm run preview   # Preview del build
npm run typecheck # Verificación de tipos
npm run lint      # ESLint
npm run test      # Vitest
```

## Roles y Guards

| Ruta | Reclutador | Referente Técnico | PM |
|------|-----------|------------------|----|
| `/processes` | ✅ CRUD | ✅ Ver asignados | ✅ Ver todos |
| `/candidates` | ✅ CRUD | ❌ | ✅ Ver |
| `/interviews` | ✅ Agendar | ✅ Confirmar/Feedback | ✅ Ver |
| `/reports` | ✅ Generar | ❌ | ✅ Descargar |

---

Ver [`PROJECT_CONTEXT.md`](../../PROJECT_CONTEXT.md) para contexto completo.

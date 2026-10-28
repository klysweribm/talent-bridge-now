# Deuda Técnica — Registro Activo
## IBM Talent Bridge

> **Proceso**: toda nueva deuda debe registrarse aquí **antes** de hacer commit.
> **Revisión**: al cierre de cada etapa del plan de remediación frontend.
> **Baseline generado**: `node good-practices/validate-quality.mjs --strict` — 2026-09-13

---

## Formato de etiqueta en código

Cuando un archivo excede su límite, agregar en **línea 1**:

```typescript
// DEBT_TECH: [tipo] excede límite de [X] líneas (actual: [Y]) — ver DEBT_TECH.md#[ID]
```

---

## 🔴 CRÍTICO — Bloquea merge sin aprobación de Tech Lead

| ID | Archivo | Actual | Límite | % | Plan de acción | Etapa |
|----|---------|--------|--------|---|----------------|-------|
| DT-002 | `apps/frontend/src/features/processes/components/pages/DashboardPage.tsx` | 291 | 90 | 323% | Descomponer en `DashboardHeader`/`KpiSection`/`ActiveProcessesList`/`UpcomingInterviewsList`, mover mocks a `infrastructure/` | Etapa 2 |

---

## 🟡 MODERADO — Requiere plan de acción antes del siguiente sprint

| ID | Archivo | Actual | Límite | % | Plan de acción | Etapa |
|----|---------|--------|--------|---|----------------|-------|
| DT-007 | `apps/frontend/src/shared/layouts/SidebarNav.tsx` | 412 líneas / función 350 líneas / complejidad 18 | 100 / 30 / 10 | — | Dividir en `NavList`, `UserProfileCard`, `SupportFooter` (ya planificado) | Etapa 2 |

---

## 🔐 AUTH-1 — Seguridad, comportamiento, docs y verificación

> Detectada en la revisión de AUTH-1 (2026-10-24). No es deuda de límite de líneas: el riesgo y el momento límite van en cada fila. Prioridad: **Alta** = resolver antes de PROC-2 / de cualquier despliegue; **Media** = antes de la demo o del siguiente sprint; **Baja** = cuando se toque el área.

| ID | Categoría | Prioridad | Problema | Plan de acción | Resolver antes de |
|----|-----------|-----------|----------|----------------|-------------------|
| DT-010 | Verificación | 🟡 Media | Sin verificación en vivo del flujo: falta el recorrido manual en navegador (F5 conserva sesión, los 3 roles `ana@`/`carlos@`/`mariana@ibm.com`, sin 404 en sidebar/dashboard). Sigue pendiente en `ROADMAP.md` → QW-1. | Ejecutar el recorrido con backend + Mongo reales y registrar el resultado en `ROADMAP.md` (Historial). Al cerrarlo, marcar AUTH-1 como cerrado en `CLAUDE.md` → "Estado actual". | Cierre de AUTH-1 |
| DT-011 | Superficie expuesta | 🟢 Baja | `GET /auth/whoami` existe solo para probar `JwtAuthGuard`/`RolesGuard`. Está protegido (recruiter), pero es endpoint de prueba en el controller de producción. | Eliminarlo (y su test) cuando exista la primera ruta real protegida por `@Roles`; mover la cobertura de guards a esa ruta. | Primera ruta protegida real (PROC-2) |
| DT-012 | UX | 🟢 Baja | El formulario de login sigue pidiendo contraseña y la ignora (`ILoginCredentials.password` se conserva para no cambiar la firma de `useLoginForm`). Puede confundir en la demo. | Quitar el campo contraseña del formulario en dev-login y ajustar `useLoginForm`/schema zod/tests; o reemplazarlo con FE-OTP-1. | FE-OTP-1 |
| DT-013 | Documentación | 🟢 Baja | Docs desactualizadas: `.claude/rules/workspace-tooling.md` y `CLAUDE.md` ("Monorepo layout") dicen que `shared-types` no está cableado en el backend; el comentario de `apps/frontend/src/shared/infrastructure/httpClient.ts` dice que ninguna feature lo importa. Ninguna de las dos cosas es cierta ya. | Actualizar los tres lugares (y mantener `.clinerules` consistente con `.claude/rules/`). | Próximo cambio de `CLAUDE.md` |
| DT-014 | Lint / tamaño de test | 🟢 Baja | Warnings `max-lines`/`max-lines-per-function` en tests de auth: `apps/backend/test/auth.integration.e2e-spec.ts` (187 líneas, límite blando 100) y `apps/backend/test/auth.e2e-spec.ts` (117). Solo warnings, 0 errores. | Partir por tema (seed / login / sesión / rechazo de tokens) y extraer el helper `buildApp` a `test/helpers/`. | Cuando se agregue el siguiente test de integración |
| DT-018 | Seguridad | 🟡 Media | El logout no invalida el JWT: solo borra el estado del cliente. Un token robado o copiado sigue válido hasta `exp` (1 h por defecto, `JWT_EXPIRATION`). QW-2 (cerrado) solo añadió el registro de auditoría en `auth_events`. | AUTH-3: access token corto + refresh opaco con hash y TTL en Mongo; el logout revoca la sesión. | Despliegue con usuarios reales |
| DT-019 | Seguridad | 🟡 Media | El token se guarda en `sessionStorage` (`auth.store.ts`), legible por cualquier script si hay un XSS. | AUTH-4: cookies `httpOnly` + `Secure` + `SameSite`, con mitigación de CSRF. | Despliegue con usuarios reales |
| DT-020 | Lint / complejidad | 🟢 Baja | FlowLog (OBS-1) sumó 7 warnings de lint (backend pasó de 8 a 15, 0 errores): `walk` en `redact.ts` (complejidad 15, máx. 10), `TraceFlow` y su closure en `trace-flow.decorator.ts` (36 y 34 líneas, máx. 30), `intercept` en `flow-log.interceptor.ts` (42) y `use` en `flow-log.middleware.ts` (34), y `test/flow-log.e2e-spec.ts` (96 líneas por función, 108 por archivo). | Partir `walk` por tipo de valor, extraer del decorador la parte síncrona y la asíncrona, y dividir el e2e por tema (como DT-014). | Cuando se toque la observabilidad (OBS-2) o antes de HARDEN-1 |
| DT-021 | Observabilidad / config | 🟡 Media | `apps/backend/Dockerfile` fija `NODE_ENV=production`, así que el FlowLog nunca se enciende en un contenedor construido con él, y para depurar en un entorno de desarrollo desplegado habría que cambiar `NODE_ENV` (lo que además activaría el dev-login). | Decidir en DEPLOY-1: variable `APP_ENV` separada de `NODE_ENV`, o aceptar que el FlowLog es solo local. | DEPLOY-1 |
| DT-022 | Tests / datos | 🟢 Baja | `auth_events` del Mongo de desarrollo contenía 9 filas `login` con `userId: 'u-1'` (2026-10-27), id que solo usan los fixtures de los e2e (`auth.e2e-spec`, `flow-log.e2e-spec`, `auth.integration.e2e-spec`); hipótesis: algún e2e usa el adapter real de eventos contra ese Mongo. Sin confirmar qué spec las escribe. Caducan por TTL (90 días), pero ensucian la auditoría. | Que los e2e usen una base propia (`MONGODB_URI` de test, como `docker-compose.test.yml`) o un puerto falso de eventos. | Antes de usar `auth_events` como auditoría real |
| DT-023 | Seguridad / config | 🟡 Media | `trust proxy` sin configurar: detrás de Vite/nginx `req.ip` es la IP del proxy y `auth_events.ip` no identifica al cliente. Activarlo con un nº de saltos mal puesto permitiría falsificar la IP con `X-Forwarded-For`. | `app.set('trust proxy', N)` en `main.ts` con N = saltos reales del despliegue; decidir junto con DEPLOY-1. | DEPLOY-1 |
| DT-024 | Tamaño de componente | 🟡 Media | `apps/frontend/src/shared/layouts/SidebarNav.tsx` pasó a 433 líneas (DT-007 la registra con 412) y mezcla lectura de stores, navegación y logout; no es un organismo y ya llamaba a `useAuthStore`/`useUiStore`. | Dividir en `NavList`, `UserProfileCard`, `SupportFooter` (DT-007) y mover el logout a un organismo `LogoutButton`. | Etapa 2 |
| DT-025 | Tooling / proceso | 🟡 Media | El skill `/roadmap-task` (`.claude/skills/roadmap-task/SKILL.md`) quedó desalineado: apunta al plan de remediación `~/.claude/plans/breezy-moseying-plum.md` (ya no existe), enruta por IDs que dejaron de ser secciones de `ROADMAP.md` (PROC-2, CAND-1, INT-1, FEED-1, REP-1, CV-1) y su paso 5 ("no releas los archivos, confía en el gate") contradice la regla de verificación independiente del repo (los gates se re-ejecutan, no se confía en el reporte del sub-agente). | Actualizar el skill tras el replanning Bench First: nuevas fuentes y IDs, y cambiar el paso 5 por verificación independiente (re-ejecutar lint, typecheck, tests y `validate-quality`). | Replanning Bench First |
| DT-026 | Diseño / tokens | 🟢 Baja | Tres desajustes entre los tokens y la documentación de diseño: (1) el color de texto `#8A6100` del badge "pendiente" que cita `UX-GUIDELINES.md` no existe en `tailwind.colors.ts` (solo `status.warning-bg #fef3d6`); (2) hay un hex suelto `#002D9C` (estado `active` del botón primario) en `apps/frontend/src/shared/components/atoms/Button/button.constants.ts`; (3) el comentario de cabecera de `apps/frontend/src/config/design-tokens.ts` cita `DESIGN/stitch_.../DESIGN.md` como fuente de verdad, aunque `DESIGN/` está gitignored y la fuente es el propio código de Tailwind. | Añadir el token de texto "pendiente" y el de `active` a `tailwind.colors.ts` y usarlos en `button.constants.ts`; reescribir el comentario de `design-tokens.ts` para que apunte a `tailwind.config.ts`. | Próximo cambio de UI o Etapa 3 |

---

## Resueltos ✅

| ID | Archivo | Resuelto en | Notas |
|----|---------|-------------|-------|
| DT-008 | `POST /auth/dev-login` abierto si faltaba `NODE_ENV` + seed corriendo en producción | AUTH-1 (2026-10-24) | Nuevo `AUTH_DEV_LOGIN_ENABLED` (solo `true` exacto; ignorado con `NODE_ENV=production`) gobierna endpoint y `DemoUsersSeeder` vía `isDevLoginEnabled()` (`capabilities/auth/infrastructure/config/dev-login.config.ts`). Agregado a `.env.example` y a ambos compose. Tests: 4 casos unit del controller + 3 escenarios e2e (404 y 0 usuarios sembrados). Verificado con el proceso real (`node dist/main`) en 3 configuraciones. **Ojo al desplegar:** si el compose/CI no define el flag, el login de desarrollo queda apagado (comportamiento buscado). |
| DT-015 | Caché de React Query sobrevivía al logout / 401 / cambio de usuario | AUTH-1 hardening (2026-10-24) | `QueryClient` único en `shared/infrastructure/queryClient.ts`; `installSessionCacheGuard` (instalado a nivel de módulo en `main.tsx`) hace `cancelQueries()` + `clear()` cuando el token pasa de presente a ausente o cambia el `user.id`. 7 tests en `sessionCacheGuard.test.tsx`, incluido uno de comportamiento (A ve sus datos → logout → B entra → el `queryFn` se re-ejecuta y B nunca ve los de A). Sabotear `clear()` hace fallar 4. **Restricción para Etapa 2 / PROC-2:** `clear()` no re-consulta un componente que sigue montado, así que todo `useQuery` debe vivir bajo el árbol protegido (regla en `frontend-architecture.md` y `.clinerules`). |
| DT-016 | Sesión vencida visible tras F5 | AUTH-1 hardening (2026-10-24) | `features/auth/utils/tokenExpiry.ts` (decodifica `exp` sin dependencia nueva; falla cerrado) + `useSessionExpiry` (limpia al montar si venció y programa timer hasta `exp`) + `ProtectedRoute`/`NotFoundRoute` tratan token vencido como sin sesión **durante el render**. 20 tests nuevos (14 de `tokenExpiry`, 6 de `useSessionExpiry` con fake timers) + 3 de router (F5 vencido, F5 vigente, vence con pantalla abierta). El test de F5 usa un `MutationObserver` para detectar si el dashboard llegó a pintarse alguna vez. Es solo UX: el 401 sigue siendo la autoridad. Reevaluar si AUTH-2 introduce refresh. |
| DT-017 | Carrera: un 401 tardío cerraba una sesión nueva | AUTH-1 hardening (2026-10-24) | `httpRequest` captura el token una vez al enviar y `endSessionIfExpired` solo limpia si ese token sigue siendo el vigente en el store. 3 tests nuevos en `httpClient.test.ts` (401 tardío con token anterior, control con el mismo token, dos 401 concurrentes). Quitar la comparación hace fallar el primero. |
| DT-009 | Frontend sin manejo de 401 | AUTH-1 (2026-10-24) | `httpClient` llama `clearAuth()` ante 401 solo si había token (un 401 de `dev-login` con email no sembrado sigue mostrándose como error del formulario); `ProtectedRoute` ya redirige a `/login` al quedar sin token. 5 tests nuevos en `httpClient.test.ts` + 1 en `AppRouter.test.tsx`. No cubre refresh de token (AUTH-2). |
| — | `AppRouter.tsx`, `StageChip.tsx`, `AvatarGroup.tsx`, `InterviewCard.tsx`, `SidebarNav.tsx` | Etapa 0 | `no-duplicate-imports`: imports de tipo duplicados consolidados en una sola línea (`import { x, type Y } from '...'`) |
| DT-001 | `LoginPage.tsx` (402 líneas) | Etapa 1 | Descompuesto en `features/auth/components/{atoms,molecules,organisms}` (golden path), validación migrada a `react-hook-form`+`zod` (`useLoginForm.ts`, ≤60 líneas), login simulado movido a `infrastructure/auth.infra.ts` (mock-first, `useMutation`). `LoginPage.tsx` queda en 12 líneas. Se agregó `@hookform/resolvers` como dependencia nueva. |
| DT-003 | `apps/frontend/src/shared/components/atoms/Icon/Icon.tsx` (89 líneas) | QW-1 | Mapa de íconos SVG extraído a `icon-paths.ts` como datos puros (sin JSX, para no contar como `.tsx` de atom); `Icon.tsx` renderiza con `React.createElement` y queda en el límite. Se agregó `Icon.test.tsx` (no existía). |
| DT-004 | `apps/frontend/src/shared/components/atoms/InputField/InputField.tsx` (77 líneas) | QW-1 | Extraído `InputFieldIcon.tsx` (prefijo), `InputFieldMessage.tsx` (error/hint) e `inputField.utils.ts` (clases/id); `InputField.tsx` queda en composición pura. |
| DT-005 | `apps/frontend/src/shared/components/atoms/Avatar/Avatar.tsx` (64 líneas) | QW-1 | Helpers de iniciales/color y clases extraídos a `avatar.utils.ts`. |
| DT-006 | `apps/frontend/src/shared/components/atoms/Button/Button.tsx` (64 líneas) | QW-1 | Mapas de variante/tamaño extraídos a `button.constants.ts`; spinner/ícono prefijo extraído a `ButtonAffix.tsx`. |

---

## Reglas de aceptación de PRs

```
🔴 CRÍTICO (> 200% del límite)   → NO merge sin aprobación Tech Lead + plan documentado aquí
🟡 MODERADO (150–200%)           → merge con ID registrado y sprint planificado
🟢 BAJO (100–150%)               → merge con ID registrado
✅ En límite (≤ 100%)            → merge normal
```

## Estadísticas baseline (2026-09-13)

| Indicador | Valor |
|-----------|-------|
| Archivos analizados | 14 |
| Críticos (bloquean) | 6 |
| Moderados | 0 (SidebarNav no está cubierto aún por `validate-quality.mjs`, solo por ESLint) |
| En límite o bajo | 8 |

> Post Etapa 1 (2026-09-13): `node good-practices/validate-quality.mjs --strict` reporta 5 críticos (DT-002 a DT-006) sobre 24 archivos analizados — DT-001 resuelto.

---

*Relacionado: [`BEST-PRACTICES.md`](./BEST-PRACTICES.md)*

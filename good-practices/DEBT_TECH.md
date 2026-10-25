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

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
| DT-003 | `apps/frontend/src/shared/components/atoms/Icon/Icon.tsx` | 89 | 50 | 178% | Extraer el mapa de íconos SVG a un archivo de datos separado (`icon-paths.ts`), dejar el componente solo con el `switch`/render | Etapa 1-2 |
| DT-004 | `apps/frontend/src/shared/components/atoms/InputField/InputField.tsx` | 77 | 50 | 154% | Extraer lógica de icono/error a subcomponente o simplificar variantes condicionales | Etapa 1-2 |
| DT-005 | `apps/frontend/src/shared/components/atoms/Avatar/Avatar.tsx` | 64 | 50 | 128% | Extraer helper de iniciales/color a `avatar.utils.ts` | Etapa 1-2 |
| DT-006 | `apps/frontend/src/shared/components/atoms/Button/Button.tsx` | 64 | 50 | 128% | Extraer mapas de variante/tamaño a constantes fuera del componente | Etapa 1-2 |

---

## 🟡 MODERADO — Requiere plan de acción antes del siguiente sprint

| ID | Archivo | Actual | Límite | % | Plan de acción | Etapa |
|----|---------|--------|--------|---|----------------|-------|
| DT-007 | `apps/frontend/src/shared/layouts/SidebarNav.tsx` | 412 líneas / función 350 líneas / complejidad 18 | 100 / 30 / 10 | — | Dividir en `NavList`, `UserProfileCard`, `SupportFooter` (ya planificado) | Etapa 2 |

---

## Resueltos ✅

| ID | Archivo | Resuelto en | Notas |
|----|---------|-------------|-------|
| — | `AppRouter.tsx`, `StageChip.tsx`, `AvatarGroup.tsx`, `InterviewCard.tsx`, `SidebarNav.tsx` | Etapa 0 | `no-duplicate-imports`: imports de tipo duplicados consolidados en una sola línea (`import { x, type Y } from '...'`) |
| DT-001 | `LoginPage.tsx` (402 líneas) | Etapa 1 | Descompuesto en `features/auth/components/{atoms,molecules,organisms}` (golden path), validación migrada a `react-hook-form`+`zod` (`useLoginForm.ts`, ≤60 líneas), login simulado movido a `infrastructure/auth.infra.ts` (mock-first, `useMutation`). `LoginPage.tsx` queda en 12 líneas. Se agregó `@hookform/resolvers` como dependencia nueva. |

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

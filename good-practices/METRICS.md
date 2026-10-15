# Métricas de Calidad

## IBM Talent Bridge

> Medición objetiva del estado del proyecto.
> **Frecuencia de revisión**: al cierre de cada etapa del plan de remediación y antes de cada deploy.

---

## Métricas de Código

### Límites de líneas por tipo de archivo

Fuente única de verdad: `LIMITS` en [`validate-quality.mjs`](./validate-quality.mjs). Resumen legible en `BEST-PRACTICES.md` §2.5 (frontend) y §3.2 (backend). Deuda registrada en [`DEBT_TECH.md`](./DEBT_TECH.md).

### Complejidad ciclomática

| Target          | Máximo aceptable | Herramienta              |
| --------------- | ---------------- | ------------------------ |
| < 5 por función | 10               | ESLint `complexity` rule (`.eslintrc-quality.js`) |

### Profundidad de anidación

| Target                     | Máximo | Acción                      |
| -------------------------- | ------ | --------------------------- |
| ≤ 2 niveles propios en JSX | 3      | Extraer sub-componente      |
| ≤ 3 niveles en código TS   | 4      | Early return / guard clause |

### Acoplamiento — direcciones permitidas

| Dirección                                                  | Estado      |
| ---------------------------------------------------------- | ----------- |
| `pages` → `organisms` → `molecules` → `atoms`              | ✅          |
| Solo `organisms`/`pages` usan React Query / Zustand        | ✅          |
| `hooks` → `infrastructure` (nunca `fetch` en hooks)        | ✅          |
| `application/services` → `application/ports`               | ✅          |
| `infrastructure/adapters` → implementa `application/ports` | ✅          |
| `atoms`/`molecules` → hooks de datos o stores              | ❌ prohibido |
| `domain` → `@nestjs/*` / `mongoose`                        | ❌ prohibido |

---

## Métricas de Tests

### Coverage targets (propuesta — confirmar al activar el gate en HARDEN-1)

| Categoría  | Target código nuevo | Mínimo aceptable |
| ---------- | ------------------- | ---------------- |
| Statements | 90%                 | 80%              |
| Branches   | 85%                 | 70%              |
| Functions  | 90%                 | 80%              |
| Lines      | 90%                 | 80%              |

### Tipo de test por capa

| Capa                                   | Tipo de test                                   |
| -------------------------------------- | ---------------------------------------------- |
| Frontend atoms/molecules               | Vitest + Testing Library (render + props)      |
| Frontend organisms/pages               | Vitest + Testing Library + `QueryClient` + `MemoryRouter`, infra mockeada |
| Backend `domain/`                      | Jest unit, sin mocks                           |
| Backend `application/services/`        | Jest unit con fake ports                       |
| Backend `infrastructure/adapters/`     | Integración (`docker-compose.test.yml`)        |
| Backend `infrastructure/controllers/`  | E2E (`npm run test:e2e`, supertest)            |

Patrón AAA (Arrange / Act / Assert) y nombres `should <X> when <condición>` — ver `.claude/rules/testing.md`.

---

## Métricas de Performance

### Frontend

| Métrica                | Target  | Herramienta                                         |
| ---------------------- | ------- | --------------------------------------------------- |
| First Contentful Paint | < 1.5s  | Lighthouse                                          |
| Time to Interactive    | < 3.5s  | Lighthouse                                          |
| Bundle size (gzipped)  | < 300KB | `npm run build` en `apps/frontend` → `dist/assets/` |

### Backend

| Métrica           | Target  | Herramienta |
| ----------------- | ------- | ----------- |
| Response time p95 | < 200ms | Logs / APM  |
| Response time p99 | < 500ms | Logs / APM  |

---

## Evolución (llenar al cierre de cada etapa)

| Fecha      | Hito     | Archivos analizados | Críticos | Moderados | Tests (frontend / backend) | Notas |
| ---------- | -------- | ------------------- | -------- | --------- | -------------------------- | ----- |
| 2026-09-13 | Etapa 0  | 14                  | 6        | 0         | 84 / 0                     | Baseline real |
| 2026-09-13 | Etapa 1  | 24                  | 5        | 0         | 97 / 0                     | DT-001 resuelto |

---

## Verificación rápida (desde la raíz)

```bash
node good-practices/validate-quality.mjs --strict
(cd apps/frontend && npm run lint && npm run typecheck && npm test -- --run)
(cd apps/backend && npm run lint && npm run typecheck && npm test)
```

---

_Relacionado: [`BEST-PRACTICES.md`](./BEST-PRACTICES.md) · [`DEBT_TECH.md`](./DEBT_TECH.md)_

# Deuda Técnica — Registro Activo
## Architecture Reviewer App

> **Proceso**: toda nueva deuda debe registrarse aquí **antes** de hacer commit.
> **Revisión mensual** — Tech Lead responsable de actualizar estado.
> **Baseline generado**: `node good-practices/validate-quality.mjs` — 2025-07

---

## Formato de etiqueta en código

Cuando un archivo excede su límite, agregar en **línea 1**:

```typescript
// DEBT_TECH: [tipo] excede límite de [X] líneas (actual: [Y]) — ver DEBT_TECH.md#[ID]
```

---

## 🔴 CRÍTICO — Bloquea merge sin aprobación de Tech Lead

| ID | Archivo | Actual | Límite | % | Plan de acción | Est. |
|----|---------|--------|--------|---|----------------|------|
| DT-001 | `apps/web/src/pages/ImportReportPage.tsx` | 220 | 80 | 275% | Extraer `useJsonValidator` hook + `JsonValidationPanel` molecule + `JsonEditorPanel` organism | 2h |
| DT-002 | `apps/web/src/pages/ProjectsPage.tsx` | 138 | 80 | 173% | Extraer `CreateProjectForm` organism + `ProjectSearchBar` molecule | 2h |
| DT-003 | `apps/api/src/capabilities/reports/infrastructure/controllers/report-import.controller.ts` | 64 | 50 | 128% | Extraer `validateBody` a `ReportValidationPipe` (shared) | 1h |
| DT-004 | `apps/web/src/molecules/report/ArchitectureSection.tsx` | 91 | 80 | 114% | Extraer `ForbiddenImportRow` y `DeviationRow` a atoms | 1h |
| DT-005 | `apps/web/src/molecules/report/ComplexitySection.tsx` | 91 | 80 | 114% | Extraer `GodObjectRow` y `LargeFileRow` a atoms | 1h |
| DT-006 | `apps/web/src/molecules/report/VerdictSection.tsx` | 87 | 80 | 109% | Extraer `VerdictItemRow` a atom | 0.5h |
| DT-007 | `apps/web/src/pages/ScanDetailPage.tsx` | 82 | 80 | 102% | Extraer `ScanProgressBanner` molecule | 0.5h |
| DT-008 | `apps/api/src/capabilities/scans/domain/dto/create-scan.dto.ts` | 41 | 40 | 102% | Eliminar 1 línea en blanco o comentario redundante | 5min |

---

## 🟡 MODERADO — Requiere plan de acción antes del siguiente sprint

| ID | Archivo | Actual | Límite | % | Plan de acción | Est. |
|----|---------|--------|--------|---|----------------|------|
| DT-009 | `apps/api/src/capabilities/reports/application/ports/report-import.port.ts` | 96 | 50 | 192% | Mover interfaces `Row` a `domain/interfaces/report-rows.ts` | 1h |
| DT-010 | `apps/api/src/capabilities/reports/application/services/report-import.service.ts` | 140 | 80 | 175% | Extraer `ReportPersistenceOrchestrator` con `persistFindings` + `persistScores` | 1.5h |
| DT-011 | `apps/api/src/capabilities/scans/infrastructure/adapters/repository/repository-indexer.adapter.ts` | 123 | 100 | 123% | Extraer `FileWalker` y `RelevanceFilter` como clases auxiliares privadas | 1.5h |
| DT-012 | `apps/api/src/capabilities/scans/infrastructure/adapters/persistence/scan-prisma.adapter.ts` | 143 | 100 | 143% | `toResponse()` ya se extrajo a `scan-response.mapper.ts`; siguiente paso: extraer los 3 métodos de `DimensionResult` (`createDimensionResults`/`updateDimensionResult`/`findDimensionResults`) a un adapter/mapper auxiliar dedicado a esa tabla | 1h |
| DT-013 | `apps/api/src/capabilities/scans/scans.module.ts` | 50 | 30 | 167% | Mover `AI_PROVIDER_MAP` y factory a `ai-provider.factory.ts` | 1h |

---

## Plan de refactor prioritario

### Sprint 1 — Críticos de alto impacto (DT-001, DT-002, DT-009, DT-010)

```
DT-001: ImportReportPage.tsx (220 → < 80 líneas)
├── hooks/useJsonValidator.ts          (tryParse + validateReport) → < 30 líneas
├── molecules/JsonValidationPanel.tsx  (banners error/warn/ok)     → < 60 líneas
└── pages/ImportReportPage.tsx         (textarea + panel + botón)  → < 50 líneas

DT-002: ProjectsPage.tsx (138 → < 80 líneas)
├── molecules/ProjectSearchBar.tsx     (input + lupa + clear)      → < 30 líneas
├── organisms/CreateProjectForm.tsx    (form completo)             → < 60 líneas
└── pages/ProjectsPage.tsx             (composición pura)          → < 60 líneas

DT-009 + DT-010: report-import port + service
├── domain/interfaces/report-rows.ts   (interfaces Row extraídas)  → < 50 líneas
├── application/ports/report-import.port.ts (solo métodos)        → < 20 líneas
└── application/services/report-import.service.ts (orquesta)      → < 80 líneas
```

### Sprint 2 — Moderados de infraestructura (DT-011, DT-012, DT-013)

Menor prioridad, no afectan features en desarrollo activo.

---

## Resueltos ✅

| ID | Archivo | Resuelto en | Notas |
|----|---------|-------------|-------|
| — | — | — | — |

---

## Reglas de aceptación de PRs

```
🔴 CRÍTICO (> 200% del límite)   → NO merge sin aprobación Tech Lead + plan documentado aquí
🟡 MODERADO (150–200%)           → merge con ID registrado y sprint planificado
🟢 BAJO (100–150%)               → merge con ID registrado
✅ En límite (≤ 100%)            → merge normal
```

## Estadísticas baseline (2025-07)

| Indicador | Valor |
|-----------|-------|
| Archivos analizados | 68 |
| Críticos (bloquean) | 8 |
| Moderados | 5 |
| En límite o bajo | 55 |
| Horas estimadas totales | ~14h |

---

*Relacionado: [`BEST-PRACTICES.md`](./BEST-PRACTICES.md) · [`METRICS.md`](./METRICS.md)*

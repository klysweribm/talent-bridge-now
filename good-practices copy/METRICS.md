# Métricas de Calidad

## Architecture Reviewer App

> Herramienta de medición objetiva del estado del proyecto.
> **Frecuencia de revisión**: mensual o post-release.

---

## Métricas de Código

### Complejidad Ciclomática

| Target          | Máximo aceptable | Herramienta              |
| --------------- | ---------------- | ------------------------ |
| < 5 por función | 10               | ESLint `complexity` rule |

**Estado actual**: No medido automáticamente (pendiente configurar ESLint).

### Profundidad de anidación JSX / nesting TS

| Target                     | Máximo | Acción                      |
| -------------------------- | ------ | --------------------------- |
| ≤ 2 niveles propios en JSX | 3      | Refactor a sub-componente   |
| ≤ 3 niveles en código TS   | 4      | Early return / guard clause |

### Acoplamiento entre módulos

**Regla vigente** (verificable con `tsc --noEmit`):

| Dirección permitida                             | Estado                                |
| ----------------------------------------------- | ------------------------------------- |
| `pages` → `organisms` → `molecules` → `atoms`   | ✅                                    |
| `application/services` → `application/ports`    | ✅                                    |
| `infrastructure/adapters` → `application/ports` | ✅                                    |
| `domain` → ninguna dependencia externa          | ✅ (objetivo, 1 violación en billing) |
| `pages` → `atoms` directo                       | ✅ permitido                          |
| `atoms` → `organisms`                           | ❌ prohibido                          |
| `domain` → `@nestjs/common`                     | ❌ prohibido                          |

---

## Métricas de Tests

> Tests no configurados aún. Este bloque define los targets para cuando se implementen.

### Coverage targets

| Categoría  | Target | Mínimo aceptable |
| ---------- | ------ | ---------------- |
| Statements | 100%   | 90%              |
| Branches   | 95%    | 85%              |
| Functions  | 100%   | 90%              |
| Lines      | 100%   | 90%              |

### Distribución por capa (backend)

| Capa                          | Tipo de test requerido          |
| ----------------------------- | ------------------------------- |
| `domain/`                     | Unit (sin mocks)                |
| `application/services/`       | Unit (puertos mockeados)        |
| `infrastructure/adapters/`    | Integration (BD real en memory) |
| `infrastructure/controllers/` | E2E (supertest)                 |

### Estructura de test (patrón AAA)

```typescript
// ✅ patrón correcto
describe('ReportImportService', () => {
  describe('importReport', () => {
    it('should create project when projectName does not exist', async () => {
      // Arrange
      const mockPort = { findProjectByName: jest.fn().mockResolvedValue(null), ... };
      const service = new ReportImportService(mockPort as ReportImportPort);
      const report = buildMockReport({ projectName: 'nuevo-proyecto' });

      // Act
      const result = await service.importReport(report);

      // Assert
      expect(mockPort.createProject).toHaveBeenCalledWith({
        name: 'nuevo-proyecto',
        repositoryPath: 'imported',
        description: 'Auto-created from manual report import',
      });
      expect(result.success).toBe(true);
    });
  });
});
```

---

## Métricas de Performance

### Frontend

| Métrica                | Target  | Herramienta         |
| ---------------------- | ------- | ------------------- |
| First Contentful Paint | < 1.5s  | Lighthouse          |
| Time to Interactive    | < 3.5s  | Lighthouse          |
| Bundle size (gzipped)  | < 300KB | `vite build` output |

**Estado actual**: bundle de producción generado en `apps/web/dist/assets/`. Ejecutar `ls -lh dist/assets/` para verificar tamaño.

### Backend

| Métrica                | Target  | Herramienta                |
| ---------------------- | ------- | -------------------------- |
| Response time p95      | < 200ms | Logs / APM                 |
| Response time p99      | < 500ms | Logs / APM                 |
| Import de reporte JSON | < 2s    | `POST /api/reports/import` |

---

## Métricas de Deuda Técnica

Estado al **2025-07** (datos reales del proyecto):

| Indicador                                 | Valor actual | Target |
| ----------------------------------------- | ------------ | ------ |
| Archivos sobre límite (crítico > 200%)    | 2            | 0      |
| Archivos sobre límite (moderado 150-200%) | 5            | 0      |
| Archivos en límite o bajo (≤ 100%)        | 46+          | 100%   |
| Horas estimadas de deuda activa           | ~11.5h       | 0h     |
| Archivos con `any` en web                 | 0            | 0 ✅   |
| Archivos con `any` en api                 | 0            | 0 ✅   |

### Evolución (llenar mensualmente)

| Mes     | Críticos | Moderados | Horas deuda | Notas            |
| ------- | -------- | --------- | ----------- | ---------------- |
| 2025-07 | 2        | 5         | 11.5h       | Baseline inicial |
| 2025-08 | —        | —         | —           | —                |
| 2025-09 | —        | —         | —           | —                |

---

## Script de verificación rápida

```bash
# Verificar límites de líneas — ejecutar desde raíz del monorepo
find apps/web/src apps/api/src -name "*.ts" -o -name "*.tsx" \
  | xargs wc -l \
  | sort -rn \
  | head -20

# Verificar TypeScript sin errores
cd apps/api && npx tsc --noEmit && echo "API ✅"
cd apps/web && npx tsc --noEmit && echo "WEB ✅"
cd packages/contracts && npx tsc --noEmit && echo "CONTRACTS ✅"
```

---

_Relacionado: [`BEST-PRACTICES.md`](./BEST-PRACTICES.md) · [`DEBT_TECH.md`](./DEBT_TECH.md)_

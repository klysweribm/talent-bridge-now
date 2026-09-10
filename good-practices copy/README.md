# /good-practices — Documentación de Calidad

> Esta carpeta es la **fuente de verdad de calidad** del proyecto Architecture Reviewer App.
> Aplica tanto a colaboradores humanos como a agentes IA que contribuyan al código.

---

## Archivos en esta carpeta

| Archivo                                          | Propósito                                     | Cuándo leerlo                                  |
| ------------------------------------------------ | --------------------------------------------- | ---------------------------------------------- |
| [`BEST-PRACTICES.md`](./BEST-PRACTICES.md)       | Convenciones de arquitectura, código y diseño | Antes de crear cualquier archivo nuevo         |
| [`DEBT_TECH.md`](./DEBT_TECH.md)                 | Registro de archivos que exceden límites      | Antes de hacer merge; al crear archivos largos |
| [`METRICS.md`](./METRICS.md)                     | Targets de calidad, performance y cobertura   | En revisiones mensuales y pre-release          |
| [`.eslintrc-quality.js`](./.eslintrc-quality.js) | Reglas ESLint con límites por tipo de archivo | Al configurar linters en CI/CD                 |
| [`validate-quality.mjs`](./validate-quality.mjs) | Script de validación de límites de líneas     | En pre-commit hook o CI                        |

---

## Cómo usar esta documentación

### Para un desarrollador nuevo

1. Leer [`BEST-PRACTICES.md`](./BEST-PRACTICES.md) completo — 15 minutos
2. Revisar [`DEBT_TECH.md`](./DEBT_TECH.md) para entender qué áreas tienen deuda activa
3. Antes de tocar un archivo marcado en DEBT_TECH, revisar el plan de acción

### Para un agente IA colaborando en el proyecto

> Las siguientes reglas son **no negociables** y se verifican automáticamente:

```
1. Nunca crear un archivo que exceda su límite sin agregar etiqueta DEBT_TECH
2. Nunca usar `any` en TypeScript
3. Nunca importar desde infrastructure en domain
4. Nunca importar desde adapters en services (solo ports)
5. Respetar límites: atoms≤50, molecules≤80, organisms≤100, pages≤80
6. Controllers≤50, services≤80, adapters≤100, ports≤50, dtos≤40
7. Preferir declarativo (.map/.filter/.reduce) sobre imperativo (for/push/mutación)
8. Single Responsibility por archivo — si necesita "y" para describirlo, extraer
```

### Para una revisión de PR

Ejecutar el script de validación:

```bash
# Desde la raíz del monorepo
node good-practices/validate-quality.mjs

# Modo estricto (falla también en moderados)
node good-practices/validate-quality.mjs --strict
```

Verificar TypeScript:

```bash
cd apps/api && npx tsc --noEmit && echo "API ✅"
cd apps/web && npx tsc --noEmit && echo "WEB ✅"
cd packages/contracts && npx tsc && echo "CONTRACTS ✅"
```

---

## Proceso de contribución a esta documentación

1. **Nuevo patrón detectado** → agregar en la sección correspondiente de `BEST-PRACTICES.md`
2. **Nueva deuda técnica creada** → registrar en `DEBT_TECH.md` antes del commit
3. **Deuda resuelta** → mover a sección "Resueltos" en `DEBT_TECH.md` con referencia al PR
4. **Nueva métrica relevante** → agregar en `METRICS.md` con valor baseline actual
5. **Cambio en límites de líneas** → actualizar `BEST-PRACTICES.md` + `.eslintrc-quality.js` + `validate-quality.mjs` en el mismo commit

---

## Decisiones arquitectónicas registradas

| Decisión                             | Alternativas consideradas                 | Razón                                                            |
| ------------------------------------ | ----------------------------------------- | ---------------------------------------------------------------- |
| React Query para estado del servidor | Redux RTK, Context+Reducer, Zustand       | 95% del estado es server-state; ya instalado; mínimo boilerplate |
| SQLite como BD principal             | PostgreSQL, MongoDB                       | Simplicidad para fase actual; Prisma facilita migración futura   |
| Bull + Redis para cola de análisis   | BullMQ, SQS, Kafka                        | Integración nativa con NestJS; análisis puede durar 30-120s      |
| Soft-delete con `visible: boolean`   | DELETE físico, tabla de papelera separada | Preserva historial; sin JOIN adicional; reversible               |
| `source: "auto"                      | "manual"` en Scan                         | Tabla separada ManualScan                                        | Evita duplicación de esquema; filtrado simple por campo |

---

_Proyecto: Architecture Reviewer App · Stack: NestJS 10 / React 18 / TypeScript 5 / Prisma / SQLite_

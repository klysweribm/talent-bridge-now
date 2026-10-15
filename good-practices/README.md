# /good-practices — Documentación de Calidad

> Esta carpeta es la **fuente de verdad de calidad** del proyecto IBM Talent Bridge.
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
1. Nunca crear un archivo que exceda su límite sin registrarlo en DEBT_TECH.md
2. Nunca usar `any` en TypeScript
3. Nunca importar NestJS/Mongoose ni infrastructure desde domain
4. Nunca importar adapters desde services (solo ports)
5. Límites por tipo de archivo: única fuente de verdad en validate-quality.mjs (LIMITS)
6. Solo organisms/pages usan React Query o Zustand; molecules/atoms solo props
7. Preferir declarativo (.map/.filter/.reduce) sobre imperativo (for/push/mutación)
8. Single Responsibility por archivo — si necesita "y" para describirlo, extraer
```

Claude Code carga estas reglas en forma condensada desde `.claude/rules/*.md` (por ruta); Bob desde `.clinerules`. Si una regla cambia aquí, actualizar ambos en el mismo commit.

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
(cd apps/backend && npm run typecheck) && echo "BACKEND ✅"
(cd apps/frontend && npm run typecheck) && echo "FRONTEND ✅"
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

| Decisión | Alternativas consideradas | Razón |
| --- | --- | --- |
| React Query (server state) + Zustand (client state), dominios separados | Solo React Query, Redux RTK, Context | El wizard/sesión/preferencias son estado cliente real; separarlos evita duplicar datos del servidor |
| MongoDB (Mongoose), sin Redis en el MVP | PostgreSQL; Redis para OTP/caché | Una sola base gestionada; OTP con índice TTL (ADR-002, ADR-008) |
| Monorepo sin herramienta de workspace | Turborepo, Nx | Simplicidad en MVP (`docs/architecture/README.md`) |
| Frontend mock-first, backend después | Backend primero | Golden path de UI validado antes de fijar contratos (plan de remediación) |
| Login OTP por correo `@ibm.com` | Password, SSO w3id directo | Menor superficie de ataque; migración futura a App ID/w3id sin romper el JWT interno (`ROADMAP.md` FE-OTP-1/AUTH-2) |

---

_Proyecto: IBM Talent Bridge · Stack: NestJS 10 / React 18 / TypeScript 5 / MongoDB / IBM Code Engine (br-sao)_

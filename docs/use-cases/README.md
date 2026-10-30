# Casos de uso por rol

Especificación funcional de **qué puede hacer cada rol, bajo qué condición,
y qué le está explícitamente prohibido**, por feature. Es más granular que
`docs/flows/README.md` (que cubre solo camino feliz) y es la fuente de
verdad para:

- Los guards `@Roles(...)` del backend (AUTH-1/AUTH-2 en adelante).
- Los tests de autorización de cada capability (403 por rol incorrecto, 4xx
  por estado inválido del recurso).
- El `roles` de cada entrada en `apps/frontend/src/shared/config/navigation.ts`
  (ya correcto hoy — estos documentos lo usan como fuente, no al revés).

Si algo aquí contradice `docs/flows/README.md`, **gana este documento** —
es la versión posterior y más detallada. Si una decisión aquí requiere
cambiar el modelo de dominio (`packages/shared-types`), eso se refleja
primero en un ADR nuevo en `docs/architecture/README.md`, nunca al revés.

## Convención

Cada caso de uso se nombra `UC-<feature>-<n>` (ej. `UC-PROC-1`). Cada
archivo abre con una tabla "Resumen de permisos" (acción × rol) y luego
detalla cada caso de uso con: rol, precondición, flujo principal y reglas
de borde/negativas (qué pasa si otro rol lo intenta, o si el recurso no
está en el estado esperado).

Las decisiones de modelo que ADR-013 deja abiertas (taxonomía de
`User.specialty`, cardinalidad de `ReportSendEvent.sentTo`, manejo del
fallo parcial `Candidate↔Process`) se citan como **pendientes** donde
aplican — este catálogo especifica comportamiento sobre el modelo ya
decidido, no resuelve lo que ADR-013 dejó abierto a propósito.

## Índice

| Archivo | Feature(s) | Roles involucrados |
| --- | --- | --- |
| [`auth.md`](./auth.md) | AUTH-1, AUTH-2, FE-OTP-1 (en `ROADMAP.md`) | Los 3 roles (login) |
| [`bench.md`](./bench.md) | BENCH-1 (en `ROADMAP.md`); solo lectura, `MATCH-1` lo consumirá | Reclutador, PM (Referente Técnico: 403) |
| [`processes.md`](./processes.md) | PROC-2 (encuadre anterior, ya no en `ROADMAP.md`) | Reclutador, Referente Técnico, PM |
| [`candidates.md`](./candidates.md) | CAND-1 (encuadre anterior) | Reclutador, PM |
| [`interviews.md`](./interviews.md) | INT-1 (encuadre anterior) | Reclutador, Referente Técnico |
| [`feedback.md`](./feedback.md) | FEED-1 (encuadre anterior) | Referente Técnico (escribe), Reclutador/PM (leen) |
| [`reports.md`](./reports.md) | REP-1 (encuadre anterior) | PM, Reclutador |

> **Encuadre anterior:** desde el 2026-10-28, PROC-2, CAND-1, INT-1, FEED-1, REP-1 y CV-1 ya no son
> secciones de `ROADMAP.md` (esperan el replanning Bench First; ver su tabla de equivalencias). Estos
> casos de uso se revisan en ese replanning.

`CV-1` no tiene archivo propio: es una acción dentro del wizard de
`processes.md` (paso 3, "Sugerir skills desde el CV"), no un flujo de
autorización distinto — se referencia desde ahí.

`HARDEN-1`/`DEPLOY-1` no tienen casos de uso: no son funcionalidad de
usuario final.

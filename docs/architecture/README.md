# Arquitectura — IBM Talent Bridge

## Visión General

IBM Talent Bridge sigue una arquitectura de **monorepo con vertical slices**. El backend usa **Arquitectura Hexagonal + DDD**, el frontend usa **Feature Slices**. Despliegue objetivo: **IBM Cloud, un solo ambiente (demo/prod), región `br-sao` (São Paulo), todo en Code Engine**.

> Los diagramas vigentes (C1, C2 y despliegue objetivo) son los Mermaid de abajo.

---

## C1 — Diagrama de Contexto

```mermaid
flowchart TB
    recruiter["Reclutador<br/>(@ibm.com)"]
    techref["Referente Técnico<br/>(@ibm.com)"]
    pm["PM<br/>(@ibm.com)"]
    candidate["Candidato / Cliente<br/>(sin login — solo recibe email)"]

    subgraph system[" "]
        tb["IBM Talent Bridge<br/>(SPA + API)"]
    end

    watsonx["watsonx.ai<br/>(análisis de CV)"]
    smtp["Servidor SMTP<br/>(relay corporativo)"]

    recruiter -- "HTTPS" --> tb
    techref -- "HTTPS" --> tb
    pm -- "HTTPS (solo lectura)" --> tb

    tb -- "extracción de datos de CV" --> watsonx
    tb -- "OTP, invitaciones, feedback, reportes" --> smtp
    smtp -. "email" .-> candidate

    style system fill:#F4F4F4,stroke:#0F62FE
```

**Notas:**
- El candidato y el cliente **no tienen acceso al sistema**; son destinatarios de correos que el reclutador dispara desde la plataforma (feedback manual, invitaciones a entrevista, reporte final).
- Slack queda fuera del alcance confirmado del MVP salvo que `INT-1` lo retome como fallback de notificación (a decidir en esa iteración, sin servicio nuevo que agregar aquí mientras no se implemente).

---

## C2 — Diagrama de Contenedores

```mermaid
flowchart TB
    user(("Reclutador / Referente / PM"))

    subgraph ce["Code Engine project — ibm-talent-bridge (br-sao)"]
        direction TB
        web["tb-web<br/>nginx (no-root) · SPA estática<br/>proxy /api → tb-api"]
        api["tb-api<br/>NestJS 10 · Hexagonal + DDD<br/>visibilidad: project-only"]
        web -- "tráfico interno del proyecto<br/>(sin CORS, mismo dominio)" --> api
    end

    mongo[("Databases for MongoDB<br/>br-sao · endpoint privado<br/>TTL index para OTP")]
    cos[("Cloud Object Storage<br/>br-sao · bucket CVs cifrado")]
    watsonx[("watsonx.ai<br/>región a validar — ver Abierto")]
    smtp[("SMTP<br/>EmailSenderPort")]

    user -- "HTTPS" --> web
    api --> mongo
    api --> cos
    api --> watsonx
    api --> smtp

    style ce fill:#F4F4F4,stroke:#0F62FE
```

**Notas:**
- `tb-web` es el único punto expuesto; `tb-api` tiene visibilidad `project-only` (no accesible fuera del proyecto Code Engine), por lo que no necesita CORS ni autenticación de red adicional entre los dos.
- Imágenes en **IBM Container Registry (ICR)**, secretos como **secrets de Code Engine**, logs en **IBM Cloud Logs** _(objetivo, no implementado: DEPLOY-1 sin arrancar)_.

---

## Diagrama de Despliegue

```mermaid
flowchart TB
    subgraph gh["GitHub Actions (main)"]
        build["build"] --> push["push a ICR"] --> deploy["ibmcloud ce app update"]
    end

    subgraph ibmcloud["IBM Cloud — región br-sao"]
        direction TB
        icr[("IBM Container Registry")]
        subgraph project["Code Engine project"]
            web2["tb-web"]
            api2["tb-api"]
        end
        secrets[("Code Engine secrets")]
        logs[("IBM Cloud Logs")]
        db[("Databases for MongoDB<br/>backup automático")]
        cosbucket[("Cloud Object Storage")]
    end

    deploy --> project
    icr --> project
    secrets -. inyecta env vars .-> web2
    secrets -. inyecta env vars .-> api2
    web2 -. logs .-> logs
    api2 -. logs .-> logs
    api2 --> db
    api2 --> cosbucket
```

**Notas:**
- Un solo ambiente IBM Cloud (demo/prod); no hay staging separado en el MVP.
- `Secrets Manager` queda como mejora de **Fase 2** — en el MVP los secretos viven directamente como secrets de Code Engine.
- Health checks de Code Engine contra `GET /api/v1/health` en `tb-api`.

---

## Arquitectura del Backend — Capas Hexagonales

```
┌─────────────────────────────────────────────────────────┐
│  INFRASTRUCTURE LAYER                                    │
│  ┌─────────────┐  ┌─────────────────────────────────┐   │
│  │ Controllers │  │ Adapters (DB, HTTP, Storage)      │   │
│  │ (REST API)  │  │ MongoDB / COS / watsonx.ai / SMTP │   │
│  └──────┬──────┘  └──────────────────┬──────────────┘   │
│         │                            │                   │
│  ┌──────▼────────────────────────────▼──────────────┐   │
│  │  APPLICATION LAYER                                │   │
│  │  ┌─────────────┐   ┌──────────────────────────┐  │   │
│  │  │  Use Cases  │   │  Ports (Interfaces)       │  │   │
│  │  │  (Services) │◄──│  Input / Output           │  │   │
│  │  └──────┬──────┘   └──────────────────────────┘  │   │
│  └─────────┼──────────────────────────────────────────┘  │
│            │                                             │
│  ┌─────────▼──────────────────────────────────────────┐  │
│  │  DOMAIN LAYER (Pure TypeScript — zero deps)        │  │
│  │  Entities · Value Objects · DTOs · Interfaces      │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Capabilities (Bounded Contexts)

| Capability | Bounded Context | Responsabilidad |
|-----------|-----------------|-----------------|
| `auth` | Identidad | JWT, dev-login (MVP) / OTP (AUTH-2), roles |
| `candidates` | Talento | CRUD, banco de perfiles, duplicados |
| `processes` | Selección | Wizard, etapas, asignación referentes |
| `interviews` | Agendamiento | Slots, disponibilidad, .ics export |
| `feedback` | Evaluación | Scoring, templates IA, visibilidad |
| `reports` | Reportes | PDF, envío correo, historial |
| `notifications` | Comunicación | Email (`EmailSenderPort` + adapter SMTP) |
| `cv-analysis` | IA | watsonx.ai, upload COS |

---

## Decisiones de Arquitectura (ADRs)

> Las decisiones previas de **Render** (deploy del frontend), **Redis**, **Watson NLU** y **IBM Event Notifications** nunca tuvieron un ADR propio — vivían implícitas en los diagramas de este documento. Quedan **descartadas** y reemplazadas por los ADR-006 a ADR-012 de abajo; no se renumeran los ADRs vigentes (001-005).

### ADR-001: Monorepo con carpetas separadas
- **Decisión:** Monorepo sin herramienta adicional (sin Turborepo/Nx en MVP)
- **Razón:** Simplicidad. Se puede agregar Turborepo en Fase 2 si el build time lo justifica.
- **Alternativas descartadas:** Polyrepo (más overhead de CI/CD), Nx (curva alta para MVP)

### ADR-002: MongoDB como base de datos principal
- **Decisión:** MongoDB flexible sobre PostgreSQL relacional
- **Razón:** Los procesos de selección tienen estructura variable. Los esquemas evolucionan rápido en MVP.
- **Alternativas descartadas:** PostgreSQL (más rígido para esquemas en evolución)

### ADR-003: Arquitectura Hexagonal + Vertical Slice en backend
- **Decisión:** Cada capability es un slice completo (domain/application/infrastructure)
- **Razón:** Cada capability puede extraerse a microservicio en Fase 2 sin tocar otros módulos.
- **Beneficio:** Testabilidad por capa, inversión de dependencias garantizada.

### ADR-004: Candidato identificado por email
- **Estado:** PENDIENTE DE REEMPLAZO (encuadre Bench First). Fija el dominio anterior; se sustituirá por ADRs nuevos. No tomar como base para trabajo nuevo.
- **Decisión:** El email es el campo único de un candidato.
- **Razón:** Evita duplicados y es el identificador natural en procesos de RRHH.

### ADR-005: Templates de correo como HTML plano sin scripts
- **Decisión:** Todos los correos son HTML inline sin `<script>`, `<link>` ni `@import`.
- **Razón:** Compatibilidad con clientes corporativos IBM (Outlook, Notes, webmail).

### ADR-006: Todo en IBM Code Engine (frontend + backend)

- **Contexto:** El frontend estaba planificado en Render (fuera de IBM Cloud); el backend ya apuntaba a Code Engine. Mantener dos proveedores duplica el manejo de secretos, dominios y observabilidad, y Render queda fuera del perímetro IBM que pide el sponsor.
- **Decisión:** Dos apps Code Engine (`tb-web`, `tb-api`) en un solo proyecto. `tb-web` sirve la SPA con nginx y hace proxy de `/api` hacia `tb-api` (visibilidad `project-only`): mismo dominio, sin CORS, API sin exposición pública directa. Requiere `apps/frontend/Dockerfile` de producción (multi-stage: build Vite en `node:22-alpine`, runtime `nginx-unprivileged`).
- **Consecuencias:** Se descarta Render. Un solo proveedor, un solo set de secretos y logs. El build del frontend necesita contexto de repo raíz (`docker build -f apps/frontend/Dockerfile .`) porque importa `packages/shared-types` por alias.

### ADR-007: Región única `br-sao` (São Paulo)

- **Contexto:** Latencia y residencia de datos para un cliente LatAm; evitar fragmentar servicios entre regiones sin necesidad.
- **Decisión:** Databases for MongoDB, Cloud Object Storage, Code Engine e IBM Container Registry viven en `br-sao`.
- **Consecuencias:** **watsonx.ai probablemente no está disponible en `br-sao`** (ver sección "Abierto" abajo) — hay que verificarlo antes de implementar `CV-1`. Si no está disponible, el texto del CV se envía de forma transitoria a la región más cercana que sí lo tenga, **sin email ni teléfono** (enmascarados antes de enviar) y sin persistir nada fuera de `br-sao`. Requiere validación de sponsor y compliance antes de comprometerse.

### ADR-008: Sin Redis en el MVP

- **Contexto:** Redis estaba planificado (sesiones, cache de disponibilidad, OTP) pero ningún código lo usa; es un servicio con costo y operación propios que no se justifica para una sola instancia en el MVP.
- **Decisión:** Los OTP (`AUTH-2`) se guardan **hasheados en MongoDB con índice TTL** (expiran solos, sin job de limpieza). El rate limiting usa el throttler en memoria de NestJS (`@nestjs/throttler`, ya configurado en `app.module.ts`).
- **Consecuencias:** Válido mientras `tb-api` corra como una sola instancia. Si se escala horizontalmente, el throttler en memoria deja de ser consistente entre instancias y se necesita un store compartido (Redis u otro) — se revisita en ese momento, no antes. Se elimina Redis de `docker-compose*.yml`, `.env.example`, la dependencia `ioredis` de `apps/backend/package.json`, y toda mención en la documentación.

### ADR-009: watsonx.ai para análisis de CV (reemplaza Watson NLU)
- **Estado:** PENDIENTE DE REEMPLAZO (encuadre Bench First). Fija el dominio anterior; se sustituirá por ADRs nuevos. No tomar como base para trabajo nuevo.

- **Contexto:** Watson NLU nunca fue un parser de CV (es análisis de sentimiento/entidades de texto genérico); watsonx.ai (modelos generativos) es la herramienta correcta para extraer datos estructurados de un CV no estructurado, y es la pieza central de la demo con el sponsor del watsonx Challenge.
- **Decisión:** `cv-analysis` expone un `CvAnalysisPort` detrás del cual se implementa un adapter para watsonx.ai (prompt + modelo configurable). Reemplaza toda mención a Watson NLU en `PROJECT_CONTEXT.md`, `ROADMAP.md` (`CV-1`), `.env.example` (`WATSONX_URL`, `WATSONX_PROJECT_ID`, `WATSONX_API_KEY`, `WATSONX_MODEL_ID`) y en el paso 3 del wizard ("Sugerir skills desde el CV").
- **Consecuencias:** El servicio nunca conoce el proveedor (watsonx.ai) directamente, solo el puerto — si watsonx.ai no está disponible en `br-sao`, cambiar el adapter o la región de la llamada no toca `cv-analysis` por fuera de `infrastructure/adapters/`. Opcionalmente reutilizable en `REP-1` para un borrador de reporte al cliente.

### ADR-010: Email detrás de un `EmailSenderPort` con adapter SMTP (reemplaza Event Notifications)

- **Contexto:** IBM Event Notifications no es un servicio de envío de correo (es un bus de eventos/alertas); nunca encajó con "enviar OTP e invitaciones por email".
- **Decisión:** `notifications` expone `EmailSenderPort` con un adapter SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`). Se quita Event Notifications de toda la documentación y de `.env.example`.
- **Consecuencias:** Actualiza el alcance de `AUTH-2` (envío de OTP) e `INT-1` (notificación al referente). Deliverability del relay SMTP corporativo queda pendiente de validar (ver "Abierto").

### ADR-011: Secretos de Code Engine + CI/CD por GitHub Actions

- **Contexto:** No había nada definido sobre registro de imágenes, manejo de secretos ni pipeline de deploy hacia IBM Cloud.
- **Decisión:**
  - Imágenes en **IBM Container Registry (ICR)**.
  - Secretos como **secrets de Code Engine** (Secrets Manager queda para Fase 2).
  - `backend-ci.yml` / `frontend-ci.yml` agregan un job de deploy que corre **solo en `main`**: build → push a ICR → `ibmcloud ce app update`, autenticado con un API key de IBM Cloud guardado como secret de GitHub.
  - Health checks de Code Engine contra `GET /api/v1/health` _(objetivo, no implementado)_.
  - Logs centralizados en **IBM Cloud Logs** _(objetivo, no implementado)_.
  - Backup automático de Databases for MongoDB (función nativa del servicio).
  - Política de retención de CVs en COS — **a definir** (no bloqueante para el MVP, se revisita en `DEPLOY-1`).
- **Consecuencias:** `DEPLOY-1` queda con alcance concreto (ver `ROADMAP.md`) en vez de "pendiente de decisión".

### ADR-012: Autenticación — dev-login → OTP, SSO en Fase 2

- **Contexto:** `AUTH-1` (dev-login con usuarios sembrados) existe para no bloquear la demo con un flujo OTP completo. SSO corporativo (w3id) requiere onboarding interno, y IBM App ID está en camino de reemplazo por **IBM Security Verify**.
- **Decisión:** MVP = `AUTH-1` (dev-login, deshabilitado si `NODE_ENV=production`) seguido de `AUTH-2` (OTP real por correo, Mongo TTL + `EmailSenderPort`, ver ADR-008 y ADR-010). SSO w3id queda para Fase 2, sin comprometerse todavía a App ID ni a su sucesor.
- **Consecuencias:** Cualquier mención futura a "IBM App ID" en código o docs debe leerse como "Fase 2, pendiente de verificar si sigue siendo App ID o pasa a IBM Security Verify" — no implementar wiring real contra App ID hasta esa verificación.

### ADR-013: Modelo de dominio y persistencia (embeber vs. referenciar, MongoDB)
- **Estado:** PENDIENTE DE REEMPLAZO (encuadre Bench First). Fija el dominio anterior; se sustituirá por ADRs nuevos. No tomar como base para trabajo nuevo.

- **Contexto:** `packages/shared-types` tenía una base razonable pero con vacíos reales: `Process.technicalRefIds` no modelaba la regla "mínimo 1 Principal + 1 Validador"; `StageHistoryEntry` no tenía el campo `status` que la propia documentación ya mencionaba; no existía ninguna entidad `Report` aunque REP-1 ya define sus endpoints; `User` no tenía cómo filtrar referentes por especialidad aunque PROC-2 ya define ese endpoint; `Feedback.visibleTo` persistía como dato una regla de autorización que en realidad es estática — y fue la causa raíz de una contradicción real encontrada entre `navigation.ts`, esta misma documentación y `ROADMAP.md` sobre quién puede acceder a `/feedback` (resuelta: el **referente técnico escribe** el feedback de la entrevista que hizo; **reclutador y PM leen** los resultados guardados desde el detalle del proceso, nunca desde el mismo formulario — `/feedback` sigue siendo exclusivo de `technical_ref`, eso ya era correcto en el código). Como el paradigma (Hexagonal + DDD + Vertical Slice sobre MongoDB) ya estaba decidido y no se reabre, el trabajo real no es "normalizar" sino decidir qué se embebe y qué se referencia, con el límite de agregado como límite de consistencia.
- **Decisión — una colección por agregado raíz:** `users`, `candidates`, `processes`, `interviews`, `feedback`, `reports`, `availabilities` (un documento por `userId`). Cada uno tiene ciclo de vida independiente y se consulta por sí solo.
  - `Process.technicalRefs` (reemplaza `technicalRefIds: string[]`) → **embebido** como `{ userId, roleInProcess: 'principal' | 'validador' }[]`: pequeño (2-4), siempre se lee/escribe junto al proceso, el rol no tiene sentido fuera de ese contexto. La regla "mínimo 1 principal + 1 validador" es una validación de `class-validator` en el DTO de PROC-2, no algo que el tipo pueda forzar.
  - `Process.candidateIds` se mantiene como **referencia** (IDs planos) — `Candidate` tiene vida propia, existe antes/después/en paralelo a cualquier proceso.
  - `Process.stageHistory` sigue **embebido** (bitácora append-only, pequeña, nunca se consulta por separado), con el nuevo campo `status: StageStatus`. Semántica: cada transición de etapa se registra una sola vez; `completed` si se avanzó con normalidad desde esa etapa, `cancelled` si el proceso se cerró/abortó estando en ella.
  - `Interview` sigue en colección propia, **referenciada** desde `Process` (nunca embebida): tiene ciclo de vida propio y se consulta de forma transversal ("mis entrevistas de hoy", calendario por referente) — embeberla obligaría a cargar el proceso completo para listar la agenda de un referente. Nuevo `rescheduleHistory` embebido (append-only, acotado). Al reprogramar, `status` vuelve a `pending` — limitación conocida y aceptada: no distingue "nunca confirmada" de "reprogramada, pendiente de reconfirmar"; la UI puede diferenciarlo revisando si `rescheduleHistory` tiene elementos. No se resuelve ahora.
  - `Feedback` en colección propia, con **todas sus FK escalares** (`interviewId`, `candidateId`, `processId`, `referentId` — nunca arrays), confirmando que la relación es 1:1:1 (un feedback por entrevista; hoy no se considera más de un referente por entrevista). Se **elimina** el campo `visibleTo`: la visibilidad es una regla de autorización estática (igual para todo documento), no un dato por documento — se aplica en código (escribe solo el referente autor; leen el reclutador/PM del proceso, o el propio autor), nunca persistida.
  - `Report` (nueva entidad) en colección propia, con `sentHistory` embebido (append-only) — mismo patrón que `stageHistory`/`rescheduleHistory`.
  - `TechnicalRefAvailability` sin cambios de forma, un documento por `userId` (upsert) — coincide con el endpoint singular `GET /availability/:referentId`.
  - Renombrados `WatsonNLUResult`/`NLUEntity` → `CvAnalysisResult`/`CvAnalysisEntity` para que el tipo deje de contradecir ADR-009 (sin consumidores reales hoy).
  - Nuevo `User.specialty?: readonly string[]`, solo con sentido para `technical_ref`, para soportar `GET /users/referents?specialty=` (PROC-2).
- **Decisión — consistencia entre agregados (`Candidate` ↔ `Process`):** es la única relación que cruza agregados (al agregar/quitar un candidato de un proceso hay que mantener `Candidate.processIds` sincronizado con `Process.candidateIds`). Se resuelve con una **llamada en memoria** del servicio de `processes` al servicio de aplicación propio de `candidates` (inyección de Nest normal entre módulos del mismo monolito) — **nunca** un adapter de `processes` tocando directamente la colección de `candidates` (eso rompería que `candidates` sea el único dueño de sus propias invariantes, ej. el índice único de `email`), y **nunca** una transacción multi-documento de Mongo (`docker-compose.yml` levanta un Mongo **standalone**, sin replica set; las transacciones de Mongo lo requieren y fallarían en runtime). La consistencia es "best-effort secuencial", no atómica: un fallo en la segunda escritura debe loguearse y propagarse como excepción tipada (nunca un `catch {}` silencioso), nunca tragarse en silencio. **Esta es la primera vez que aparece este problema y es precedente general para el resto del monolito** (`interviews↔processes`, `feedback↔interviews`, `reports↔feedback` tendrán la misma forma): llamadas en memoria entre servicios de capabilities del mismo monolito, nunca un adapter cruzando a la colección de otra capability.
- **Convención — `domain/interfaces/` vs. `shared-types`:** cada capability importa las entidades directamente de `@ibm-talent-bridge/shared-types` en vez de redefinirlas; `domain/interfaces/` queda reservado solo para value objects **locales** a esa capability, que no son parte del contrato compartido entre apps. `shared-types` mantiene su propia convención de nombres (sin prefijos `I`/`T`/`E` — es un contrato cruzado consumido también por el frontend, no código backend-interno); el prefijo de `.claude/rules/global-engineering.md` aplica solo a tipos nuevos backend-locales, no a este archivo.
- **Índices a registrar cuando cada capability escriba su schema** (no se crean en este ADR, son plumbing para PROC-2/INT-1/REP-1): único en `Feedback.interviewId` (fuerza el 1:1:1 en la base, no solo en código); `Report.processId`; compuesto `Interview.{referentId, scheduledAt}` (para "mis entrevistas, ordenadas por hora"); `Process.technicalRefs.userId` (para "procesos donde X es referente").
- **Consecuencias / Abierto (deferido a la tarea que corresponda, no se resuelve aquí):**
  - Taxonomía de `User.specialty` (texto libre vs. catálogo controlado, para evitar que "React"/"ReactJS"/"react" fragmenten el filtro) — PROC-2.
  - Cardinalidad de `ReportSendEvent.sentTo` (¿un evento por destinatario, o un array por evento, si un envío tiene varios destinatarios a la vez?) — REP-1.
  - Manejo explícito del fallo parcial en la sincronización `Candidate↔Process` más allá de "loguear y propagar" — PROC-2/CAND-1.
  - Política de cambios "breaking" en `shared-types` una vez que las capabilities tengan consumidores reales (hoy no hace falta tooling de migración porque no hay ninguno todavía).

---

## Abierto — validar con sponsor/compliance

- **Disponibilidad de watsonx.ai en `br-sao`**, y si no está disponible, si el envío transitorio del texto del CV (sin email/teléfono, enmascarados) a otra región es aceptable para compliance. Mismo chequeo para Databases for MongoDB y Code Engine en `br-sao` (se asumen disponibles, pero no verificado contra la consola real).
- **Cuenta de IBM Cloud:** quién es el owner y quién paga — una cuenta interna de IBM Consulting o una cuenta de la iniciativa/challenge.
- **Relay SMTP corporativo:** disponibilidad real y si los correos a `@ibm.com` y a dominios de clientes externos llegan sin marcarse como spam (sin esto, OTP e invitaciones no son confiables).
- **Exposición de la app:** internet público vs. detrás de la VPN de IBM, y si lleva dominio propio (afecta `tb-web` y el certificado TLS).
- **SSO:** si w3id/IBM Security Verify se habilita en Fase 2 requiere onboarding interno — no asumir que es "solo configuración" hasta confirmarlo con el equipo de identidad de IBM.

# Roadmap — Features planeados

> Backlog de features ordenado por **lo que toca hacer**: arriba lo pendiente y lo más importante, abajo lo
> ya cerrado. El detalle de lo cerrado vive en git, en `good-practices/DEBT_TECH.md` y en `docs/use-cases/`.
> El encuadre anterior (procesos → candidatos → entrevistas → feedback → reportes) quedó archivado fuera de
> este documento y espera el replanning Bench First.
>
> **Última actualización:** 2026-10-30 (BENCH-1 verificado en vivo; falta solo el recorrido completo en navegador)

**Cómo se mantiene:** al avanzar una feature se actualiza su fila en "Features vigentes" y, si queda
cerrada, su sección se mueve al bloque "Cerrado" del final. Lo pendiente nunca se entierra bajo lo hecho.

---

## Leyenda

| Símbolo  | Significado                                                      |
| -------- | ---------------------------------------------------------------- |
| 🟢 Baja  | 1-2 días, sin dependencias fuertes                                |
| 🟡 Media | 3-5 días, requiere diseño previo o coordinación con otra feature |
| 🔴 Alta  | 6+ días, requiere integración externa (IBM Cloud) o varias capas |
| 📌       | Sin arrancar                                                      |
| 🚧       | En progreso                                                       |
| ✅       | Completado                                                        |

**Prioridad (HIGH \| MEDIUM \| LOW):** en un feature cerrado refleja lo que le **queda pendiente**,
no el feature en sí.

---

## Backlog Bench First — pendiente de replanning

El producto se reencuadra como **Bench First**. `BENCH-1` ya aportó los primeros tipos de `shared-types` y su
caso de uso (`docs/use-cases/bench.md`), pero todavía faltan los ADR y el replanning completo (alcance B). Hasta el replanning, estas son las equivalencias acordadas:

| Encuadre anterior | Reemplazo Bench First |
| --- | --- |
| PROC-2 | Oportunidades + box mágico |
| CAND-1 | BENCH (mock) + Talent Pool + carga de perfil |
| INT-1 | Disponibilidad + booking top 5 + entrevistas por etapa |
| FEED-1 | Feedback en 3 etapas asistido por IA |
| REP-1 | Dashboard ejecutivo (PDF pasa a LOW) |
| CV-1 | Acción del asistente "analizar perfil" vía ICA (`AiProviderPort`) |

Los IDs PROC-2, CAND-1, INT-1, FEED-1, REP-1 y CV-1 ya no existen como secciones; `/roadmap-task` debe
actualizarse tras el replanning. Los casos de uso por rol y feature siguen en `docs/use-cases/` (encuadre
anterior, a revisar en el replanning).

### Features vigentes

Orden: primero lo que requiere acción, luego el backlog por prioridad, al final lo cerrado.

| ID | Estado | Prioridad | Depende de |
| --- | --- | --- | --- |
| BENCH-1 | 🚧 verificado en vivo (stack, `curl` por rol, imagen de producción); falta el recorrido con los 3 roles | HIGH | AUTH-1, Etapa 2 |
| QW-1 | 🚧 implementado, falta el recorrido en navegador (DT-010) | HIGH | — |
| FE | 🚧 Etapas 0-2 en código; Etapa 2 pendiente de revisión en navegador | MEDIUM | — |
| FE-OTP-1 | 📌 sin arrancar | LOW | Etapa 1 (cerrada) |
| AUTH-2 | 📌 sin arrancar | LOW | FE-OTP-1 |
| AUTH-3 | 📌 sin arrancar | LOW | QW-2, AUTH-2 |
| AUTH-4 | 📌 sin arrancar | LOW | AUTH-3 |
| HARDEN-1 | 📌 sin arrancar | LOW | features de UI |
| DEPLOY-1 | 📌 sin arrancar | LOW | HARDEN-1 |
| AUTH-1 | ✅ cerrado en código (falta DT-010) | HIGH | QW-1 |
| QW-2 | ✅ cerrado en código (falta DT-010) | HIGH | AUTH-1 |
| OBS-1 | ✅ cerrado en código | LOW | — |

---

## Estado actual / próximo paso

> Se actualiza al cerrar cada tarea (`/roadmap-task` o `/update-roadmap`). El detalle histórico vive en el
> Historial de abajo y en `good-practices/DEBT_TECH.md` → Resueltos.

**Próximos pasos, en orden:**
1. **Recorrido en navegador con los 3 roles** (ana@, carlos@, mariana@ibm.com): cierra BENCH-1 y de paso DT-010 (F5
   conserva la sesión, ningún link da 404, aviso de inactividad a los 360 s). Con eso se pueden cerrar QW-1, AUTH-1,
   QW-2 y la Etapa 2, y las deudas DT-002, DT-007 y DT-024. La primera prueba visual de `/bench` ya salió bien;
   falta el barrido por rol y los demás puntos.
2. **Seguridad del repositorio:** la URL de `origin` lleva un token de GitHub en texto plano dentro de
   `.git/config`. Revocarlo, pasar a un credential helper o SSH y reescribir la URL sin credenciales. Además
   `~/.gitconfig` tiene `http.sslverify=false`.
3. **Decidir qué hacer con los 21 commits con `Co-Authored-By`:** ya están en `origin` (`feature/improvements` y
   `main`), así que quitarlos exige `--force`, descartado hasta nueva orden. No hay commits locales sin subir
   con esa línea; los nuevos de BENCH-1 no la llevan.
4. **Replanning Bench First** (ADR, `docs/domain.md`, casos de uso, `shared-types`) y, después, **AI-1**
   (asistente sobre la banca vía `AiProviderPort`, que enviará a ICA solo los campos sin datos personales de
   `IBenchResource`) y `MATCH-1`. Al replanificar hay que actualizar `/roadmap-task` (DT-025).
5. Opcionales: OBS-2 y DT-020; deudas nuevas de BENCH-1 (DT-027 a DT-029).

**Gates (2026-10-30, tras BENCH-1):** backend 112 unit / 74 e2e (antes 39 / 41), lint 0 errores / 14 warnings;
frontend 375 tests (antes 264), lint 0 errores (2 warnings preexistentes en `sessionCacheGuard.test.tsx`; el
script `npm run lint` usa `--max-warnings 0` y por eso sale en rojo), build OK, `validate-quality --strict`
0 críticos sobre 107 archivos.

**Git:** rama `feature/BENCH`, commits locales sin push. `origin` apunta a `klysweribm/talent-bridge-now`;
nunca `--force`.

---

## 🚧 En curso y por verificar

> Lo que sigue abierto. Orden: lo más importante primero.

## BENCH-1 — Banca desde mock JSON (HIGH)

**Estado:** 🚧 verificado en vivo salvo el recorrido en navegador con los 3 roles · **Complejidad:** 🟡 Media · **Casos de uso:**
[`docs/use-cases/bench.md`](./docs/use-cases/bench.md)

Primer dato de negocio real: 30 recursos inventados y anonimizados (`bench.mock.json`) se siembran en la colección
`bench_resources`; `GET /bench` (paginado y filtrable), `GET /bench/skills` y `GET /bench/:benchCode` los exponen a
`recruiter` y `pm` (`TODO(RBAC-1)`), y `/bench` los muestra con filtros en la URL y un detalle lateral. Solo lectura.
Es la base de `MATCH-1` y del dashboard ejecutivo. Commits: `797e4fb` (tipos), `f8fbfd5` (backend), `05dc818` (frontend) y `febf8af` (docs).

**Decisiones:** reutiliza `PaginatedResponse` (campo `data`, no `items`); los tipos nuevos de `shared-types` llevan
prefijo I/T/E y son solo tipos (la imagen de producción no resuelve el alias en runtime, así que los arrays de enum
viven en el backend); el catálogo de skills solo incluye skills de recursos visibles por defecto; `technical_ref`
que entra por URL se redirige a `/dashboard`; `BOTTOM_NAV_MAX_ITEMS` sube de 4 a 5.

**Criterios de éxito:**
- [x] `shared-types` con los tipos de banca, sin email, teléfono ni salario.
- [x] Seed idempotente por `benchCode` y fail-closed (`BENCH_SEED_ENABLED=true` exacto, nunca en producción), con el
      mock validado ítem a ítem (e2e: dos arranques dan 30 documentos).
- [x] `GET /bench`: filtros skills (AND, sin distinguir mayúsculas), seniority, `availableBy`, país y estado;
      paginación acotada (`limit` ≤ 50), orden estable; 401 / 403 / 400 / 404 (e2e contra Mongo real).
- [x] Índices del schema creados (único en `benchCode`; `seniority`, `status`, `availableFrom`, `skills.name`).
- [x] Pantalla `/bench` con filtros en la URL, página reiniciada al cambiar un filtro, estados de carga, vacío y
      error, y detalle de un recurso (tests de componente).
- [x] Gates en verde: backend 112 unit / 74 e2e, frontend 375 tests, 0 críticos en `validate-quality`.
- [x] Stack recreado con podman (2026-10-30): `/health` con `database: "up"` (se leyó el cuerpo), `bench seed: 30 upserted`,
      30 documentos (22 `available`, 5 `soft_booked`, 3 `assigned`) y los 5 índices vistos con `mongosh`, y 30 tras
      reiniciar el backend. Ningún documento con email, teléfono o salario.
- [x] `curl` con token de cada usuario demo contra el stack real: pm y recruiter 200 en los 3 endpoints,
      technical_ref 403, sin token 401; `limit=500`, `limit=0`, `page=0`, `seniority=guru`, `availableBy` inválido
      (incl. `2026-W44` y `2026-305`) y `skills=` vacío dan 400; `BN-9999` da 404; `skills=Java,Spring Boot&seniority=sr`
      devuelve 3 recursos que cumplen ambas; el total visible es 27.
- [x] Imagen de producción (`apps/backend/Dockerfile`, contexto en la raíz) construida y arrancada con
      `NODE_ENV=production`: resuelve el JSON, ningún `.js` compilado importa `shared-types`, el seed se omite y
      `/health` responde `up`. Imagen y base de prueba eliminadas.
- [x] Primera prueba visual de `/bench` hecha por el equipo: funciona.
- [ ] Recorrido en navegador con los tres roles (ana@, carlos@, mariana@ibm.com) siguiendo la checklist de
      `docs/use-cases/bench.md`, junto con DT-010.

**Límites que deja:** el filtro de skills usa regex sin distinguir mayúsculas, que no aprovecha el índice; el seed
restablece los datos del mock en cada arranque; las fechas del mock son absolutas; la lista de países vive en el
frontend; el detalle lateral no atrapa el foco con Tab (ver DT-027 a DT-029).

---

## QW-1 — Quick wins previos a la demo (gates, robustez, fundaciones) (HIGH)

**Estado:** 🚧 implementado (2026-10-15), pendiente de verificación en vivo · **Complejidad:** 🟢 Baja

Gates (atoms bajo límite, ESLint y specs en backend, Dockerfile de producción, CI en Node 22), demo robusta
(navegación única, `ComingSoon`/404 dentro del layout, `ErrorBoundary`, sesión persistida, usuarios demo
`ana@`/`carlos@`/`mariana@ibm.com`) y fundaciones (`shared-types` en el frontend, `env.ts`, `httpClient`,
Mongoose/helmet/throttler/health). `shared-types` se cableó en el backend con BENCH-1, solo con `import type`. Detalle en `git log` y `DEBT_TECH.md`.

**Pendiente real:**
- [ ] Recorrido en navegador: ningún link lleva a 404, F5 conserva la sesión y entran los 3 roles demo
      (DT-010; ya cubierto por los tests de `AppRouter`).
- [x] `/api/v1/health` reporta `database: "up"` con Mongo arriba (verificado leyendo el cuerpo, 2026-10-30).
- [ ] `npm run lint` del frontend sale en rojo por `--max-warnings 0`: quedan 2 warnings en
      `sessionCacheGuard.test.tsx` (0 errores desde la Etapa 2).

---

## FE — Remediación frontend (auth + processes) (MEDIUM)

**Estado:** 🚧 Etapas 0-2 en código · **Complejidad:** 🔴 Alta (multi-etapa)

Especificación de UX: `docs/design/UX-GUIDELINES.md` (manda sobre cualquier mockup). Condición vigente: todo
`useQuery` bajo el árbol de rutas protegido (DT-015, `.claude/rules/frontend-architecture.md`).

- [x] Etapa 0 — fundaciones de calidad.
- [x] Etapa 1 — `LoginPage.tsx` (golden path `features/auth`, DT-001).
- [ ] Etapa 2 — cerrada en código, **pendiente de revisión en navegador (DT-010)**: shell y `SidebarNav`
      (`dd77ff8`), Inicio del reclutador (`2ef1a5b`), guardas de ruta y `PublicRoute` (`0326925`). Frontend 264
      tests y `validate-quality` con 0 críticos. DT-002, DT-007 y DT-024 siguen abiertas hasta esa revisión.
- [ ] Etapas 3-7 — wizard/detalle de procesos y features de candidatos, entrevistas, feedback y reportes
      (solo UI sobre mocks). Esperan el replanning Bench First.
- [ ] Etapa 8 — endurecimiento transversal (ver HARDEN-1).

---

## 📌 Backlog (por prioridad)

> Sin arrancar. Ordenado por dependencias: cada feature espera a la anterior.

## FE-OTP-1 — Login OTP por correo corporativo + panel de marca (LOW)

**Estado:** 📌 sin arrancar · **Complejidad:** 🟡 Media-Alta (3-4 días)

Sustituye el login por contraseña por correo `@ibm.com` → código de 6 dígitos (frontend mock-first:
`requestOtp`/`verifyOtp` en `auth.infra.ts`) y añade un panel de marca recortado a logo, título y una frase
de valor (`docs/design/UX-GUIDELINES.md` §3.1). Sin fallback a contraseña y sin "IBM Verify"/YubiKey. Reabre
`LoginForm` como cambio de alcance, no como deuda. Depende solo de la Etapa 1 (cerrada). Prioridad baja: el
login no es la pantalla diferenciadora y AUTH-1 ya entrega el JWT real.

La especificación completa (alcance A-C, hooks, infraestructura, tests, riesgos y sus 12 criterios de éxito
abiertos) se movió a `docs/use-cases/auth.md` → "Especificación FE-OTP-1".

---

## AUTH-2 — Backend real de autenticación OTP (JWT end-to-end) (LOW)

**Estado:** 📌 sin arrancar (backlog — no iniciar hasta que FE-OTP-1 cierre) · **Prioridad:** LOW · **Complejidad:** 🔴 Alta

### Motivación

El login hoy es (o será, tras FE-OTP-1) una simulación de OTP en frontend
(`features/auth/infrastructure/auth.infra.ts`). Sin backend real no hay forma
de emitir un código verdadero, protegerlo contra fuerza bruta, ni de que el
guard de rol (`router/guards/RoleRoute`) refleje una sesión real en vez de un
mock en Zustand. Diseño vigente: el OTP se guarda hasheado en MongoDB con índice
TTL (ADR-008) y el correo sale por `EmailSenderPort` + adapter SMTP (ADR-010); no
hay Redis ni IBM Event Notifications en el MVP (ambos descartados).

### Alcance

- Casos de uso detallados: [`docs/use-cases/auth.md`](./docs/use-cases/auth.md).
- `capability/auth`: `POST /auth/otp/request`, `POST /auth/otp/verify`,
  `POST /auth/refresh`, `POST /auth/logout`.
- **Generación y almacenamiento de OTP**: código de 6 dígitos criptográficamente
  aleatorio, **hasheado** antes de guardar en **MongoDB con índice TTL**
  (sin Redis — ver ADR-008 en `docs/architecture/README.md`), TTL de
  ~10 min, invalidar el código anterior al solicitar uno nuevo para el mismo
  correo.
- **Rate limiting / anti-brute-force**: throttler en memoria de NestJS
  (`@nestjs/throttler`, ya configurado en `app.module.ts`) para el máximo N
  de solicitudes de OTP por email/IP en X minutos; lockout tras M intentos
  de verificación fallidos para el mismo código/sesión (contador en el mismo
  documento Mongo del OTP, no en Redis).
- **Envío real**: `EmailSenderPort` + adapter SMTP (ver ADR-010) con
  template de email dedicado en `packages/email-templates` (HTML plano, sin
  scripts, según regla del monorepo).
- **Provisión de usuarios/roles**: mecanismo para pre-registrar correos con
  rol asignado (`recruiter` | `technical_ref` | `pm`) — sin esto, un login OTP
  exitoso no tiene de dónde sacar el rol para el JWT. Definir si es una
  colección Mongo administrada manualmente (MVP) o una pantalla de admin
  (fuera de alcance de este task si no está ya planificada).
- JWT con rol embebido, expiración corta + refresh token (sin cambios respecto
  al diseño original).
- Guard NestJS (`@UseGuards(JwtAuthGuard)`) + decorator `@Roles(...)` reusable
  en el resto de capabilities (sin cambios).
- Frontend: `auth.infra.ts` pasa de mock a `fetch` real (`requestOtp`/
  `verifyOtp`); `auth.store.ts` persiste el token (ya existe la forma, cambia
  el origen del dato).

### Dependencias

**FE-OTP-1** (el `infrastructure/auth.infra.ts` mock-first con `requestOtp`/
`verifyOtp` debe existir primero para que este feature solo cambie el cuerpo
de esas funciones, no el resto del flujo).

### Complejidad y tamaño

**Alta** — sube de Media a Alta respecto a la versión original (password)
por el trabajo de seguridad específico de OTP (rate limiting, lockout, hash,
invalidación) más la provisión de usuarios/roles, que no existía como
problema en el diseño anterior.

### Criterios de éxito

- [ ] `POST /auth/otp/request` genera un código real, lo hashea antes de
      guardar en MongoDB (índice TTL), y lo envía por `EmailSenderPort`
      (adapter SMTP).
- [ ] `POST /auth/otp/verify` rechaza código incorrecto/expirado/reusado con
      401, y aplica lockout tras N intentos fallidos.
- [ ] Rate limiting verificado: solicitar OTP repetidamente en un corto
      período es rechazado antes de llegar a enviar email.
- [ ] Existe un mecanismo (aunque sea manual/admin de datos) para asignar rol
      a un correo antes de su primer login.
- [ ] Un endpoint protegido con `@Roles('recruiter', 'pm')` rechaza a
      `technical_ref` con 403.
- [ ] Las guardas de ruta del frontend (`router/guards/`) siguen funcionando
      sin cambios de contrato (mismo `UserRole`).
- [ ] El código OTP nunca aparece en logs ni responses en texto plano.

---

## AUTH-3 — Sesión corta con refresh y expiración por inactividad en backend (LOW)

**Estado:** 📌 sin arrancar · **Prioridad:** LOW · **Complejidad:** 🟡 Media · **Registrado:** 2026-10-27

### Motivación

Hoy el JWT dura 1 h y el logout no lo invalida (**DT-018**): un token robado sirve hasta `exp`. Se busca que el servidor también mate la sesión por inactividad y que no queden tokens huérfanos.

### Alcance

- **Diseño recomendado (patrón estándar):** access JWT corto + **refresh token opaco**, guardado con hash en Mongo (colección `sessions`) con índice TTL. El refresh rota en cada uso y se detecta su reutilización. Sin actividad no hay refresh, la sesión caduca y su registro desaparece solo por TTL.
- Refresh bajo demanda (ante un 401 o cerca del vencimiento, y solo si hubo actividad) en vez de polling continuo, para no generar tráfico en reposo. "Renovar en cada petición" implica una escritura en BD por request y se evalúa al planificar.
- Parámetros por env (se añaden a `.env.example` entonces): TTL del access token y TTL deslizante de la sesión. Regla validada al arrancar: TTL de sesión ≥ idle timeout + aviso (QW-2) + margen.
- El logout revoca la sesión (cierra DT-018).
- **Pregunta abierta:** se mencionó un TTL de 3 min y luego una renovación de 4 min; fijar un solo valor al planificar.

### Dependencias

QW-2 (`auth_events`, idle timer) y AUTH-2 (cambia la emisión de tokens; hacerlo antes obligaría a rehacerlo).

### Criterios de éxito

- [ ] Sin actividad el refresh no ocurre y la sesión desaparece de Mongo por TTL.
- [ ] Tras el logout el access token deja de aceptarse (o caduca en minutos) y el refresh queda revocado.
- [ ] Reutilizar un refresh ya rotado revoca la sesión.
- [ ] DT-018 cerrada.

---

## AUTH-4 — Tokens de sesión en cookies httpOnly (LOW)

**Estado:** 📌 sin arrancar · **Prioridad:** LOW · **Complejidad:** 🟡 Media · **Registrado:** 2026-10-27

### Motivación

El token vive en `sessionStorage`, legible por cualquier script si hay un XSS (**DT-019**). Una cookie `httpOnly` no es accesible desde JavaScript, y es la práctica habitual para sesiones de navegador.

### Alcance

- Access y refresh en cookies `httpOnly`, `Secure` (forzado en producción; configurable en local porque Safari no acepta `Secure` en `http://localhost`) y `SameSite=Lax/Strict`. La cookie de refresh con `Path=/api/v1/auth`, para que solo viaje a los endpoints de auth.
- **Cuidados:** el navegador la envía sola, así que aparece el riesgo CSRF → `SameSite` más una cabecera personalizada obligatoria en endpoints que cambian estado. Un XSS aún puede hacer peticiones en nombre del usuario aunque no copie el token: no es una bala de plata.
- Piezas: `cookie-parser` en el backend (**nueva dependencia: preguntar antes**), `credentials: 'include'` en `httpClient`, y CORS con credenciales (ya `true` en `main.ts`). Frontend y API comparten origen (proxy de Vite / nginx `/api`), lo que simplifica las cookies. Swagger conserva el flujo `Authorization: Bearer`.
- El frontend deja de guardar el token en `sessionStorage`.

### Dependencias

AUTH-3.

### Criterios de éxito

- [ ] El token no es legible desde `document.cookie` ni `sessionStorage`.
- [ ] Login, refresh y logout funcionan solo con cookies, en local y tras el proxy.
- [ ] Una petición cross-site sin la cabecera exigida es rechazada.
- [ ] DT-019 cerrada.

---

## HARDEN-1 — Endurecimiento transversal final (LOW)

**Estado:** 📌 sin arrancar · **Prioridad:** LOW · **Complejidad:** 🟢 Baja (por ítem, varios ítems)

### Motivación

Corresponde a la Etapa 8 del plan de remediación frontend — se lista aquí
también porque son decisiones de producto/infra, no solo de código, y deben
cerrarse antes de DEPLOY-1.

### Alcance

- `validate-quality.mjs --strict` bloqueante en `.github/workflows/frontend-ci.yml`.
- Decisión de cierre sobre `@carbon/react` (eliminar si sigue sin uso tras todas las features).
- `config/env.ts` tipado sobre `import.meta.env`.
- Error boundary global en `AppLayout`.
- Tests faltantes (`useLoginForm`, `ui.store.ts`, hooks nuevos de cada feature).
- Decisión pendiente (registrada 2026-10-15): `@carbon/react` está instalado y tiene 0 imports — mantener (y adoptar componentes) o quitar la dependencia.

### Dependencias

Todas las features de UI deben existir para que la decisión de `@carbon/react` sea informada (no se puede decidir "sin uso" a mitad de camino).

### Criterios de éxito

- [ ] CI falla si `validate-quality.mjs --strict` reporta un crítico nuevo.
- [ ] `@carbon/react` eliminado del `package.json` o su primer uso real documentado.
- [ ] Ningún componente puede tumbar toda la app sin pasar por el error boundary.

---

## DEPLOY-1 — Deploy real en IBM Cloud (LOW)

**Estado:** 📌 sin arrancar · **Prioridad:** LOW · **Complejidad:** 🔴 Alta

### Motivación

El MVP corre hoy solo en Docker/Podman local. Falta el despliegue real
contra IBM Cloud. Arquitectura objetivo definida y registrada como ADRs en
`docs/architecture/README.md` (ADR-006 a ADR-012): todo en Code Engine,
región `br-sao`, un solo ambiente demo/prod.

### Alcance

- **Infra IBM Cloud provisionada en `br-sao`:** Databases for MongoDB, Cloud Object Storage, un proyecto de Code Engine con dos apps (`tb-web`, `tb-api`), IBM Container Registry.
- **`tb-web`:** `apps/frontend/Dockerfile` de producción (multi-stage, nginx no-root) sirviendo la SPA + proxy `/api` hacia `tb-api` (visibilidad `project-only`, sin CORS).
- **`tb-api`:** visibilidad `project-only`, health check contra `GET /api/v1/health`.
- **Secretos:** secrets de Code Engine (no Secrets Manager — queda para Fase 2); variables de entorno reales nunca committeadas (ya cubierto por `.gitignore`).
- **CI/CD:** job de deploy en `backend-ci.yml` y `frontend-ci.yml`, solo en `main`: build → push a ICR → `ibmcloud ce app update`, autenticado con un API key de IBM Cloud guardado como secret de GitHub.
- **Observabilidad:** IBM Cloud Logs para `tb-web` y `tb-api`.
- **Backups:** backup automático de Databases for MongoDB (función nativa del servicio).
- **Retención de CVs en COS:** política a definir (no bloqueante para el primer deploy).
- **Pendiente de validar antes de cerrar** (ver "Abierto" en `docs/architecture/README.md`): disponibilidad de watsonx.ai en `br-sao`, owner/billing de la cuenta IBM Cloud, deliverability del relay SMTP corporativo, exposición internet vs. VPN IBM + dominio propio.

### Dependencias

HARDEN-1 (no se despliega sin el gate de CI ni la decisión de dependencias cerrada).

### Criterios de éxito

- [ ] La app es accesible por URL pública/interna IBM sin depender de `localhost`.
- [ ] Los flujos de la POC Bench First (por definir en el replanning) funcionan contra servicios reales de IBM Cloud, no mocks.
- [ ] Credenciales de servicios IBM Cloud nunca en logs, responses, ni el repo (secrets de Code Engine).
- [ ] `tb-web` sirve la SPA y el proxy `/api` llega a `tb-api` sin CORS.
- [ ] El pipeline de GitHub Actions despliega automáticamente en cada push a `main`.
- [ ] `GET /api/v1/health` responde `database: "up"` contra Databases for MongoDB real.

---

## ✅ Cerrado en código

> Features terminadas. Se conservan por referencia; lo único que les queda abierto es el recorrido en navegador
> (DT-010), que ya figura en "Próximos pasos".

## AUTH-1 — Login de desarrollo con JWT real (HIGH)

**Estado:** ✅ cerrado en código (2026-10-24); falta el recorrido en navegador (DT-010) · **Complejidad:** 🟢 Baja

`POST /auth/dev-login` falla cerrado: solo existe con `AUTH_DEV_LOGIN_ENABLED=true` exacto y nunca con
`NODE_ENV=production` (DT-008). `JwtAuthGuard`, `RolesGuard` y `@Roles` viven en `shared/auth/`, y el seed
de los 3 usuarios demo es idempotente. El swap de `auth.infra.ts` de mock a `httpClient` se hizo el
2026-10-24, y `httpClient` limpia la sesión ante un 401 con token activo (DT-009). Test de integración
contra Mongo real en `apps/backend/test/auth.integration.e2e-spec.ts`. Casos de uso: `docs/use-cases/auth.md`.
AUTH-2 solo cambia **cómo** se emite el JWT, no su contrato.

- [x] Los 3 logins devuelven JWT con el rol correcto; 404 con `NODE_ENV=production`; 401 sin token y 403
      con rol incorrecto en un endpoint protegido (verificado en vivo).
- [x] `auth.infra.ts` conectado a `httpClient` (2026-10-24).
- [ ] Recorrido manual en navegador (DT-010).

---

## QW-2 — Higiene de sesión y entorno (HIGH)

**Estado:** ✅ cerrado en código y verificado en vivo con curl + Mongo (2026-10-27) · **Complejidad:** 🟢 Baja

Commits: `a1c5b96` (variables de entorno sin consumidor retiradas; `WATSONX_*`, `COS_*`, `SMTP_*`,
`SLACK_WEBHOOK_URL`, `JWT_REFRESH_EXPIRATION` y `APPID_*` vuelven junto con su adapter), `1341f8a`
(`POST /auth/logout` y colección `auth_events` con login y logout, TTL `AUTH_EVENT_RETENTION_DAYS`=90),
`666fcf0` (`useLogoutMutation`) y `71cb074` (idle timer: aviso a los 360 s y cuenta atrás de 60 s por
`VITE_IDLE_TIMEOUT_SECONDS`/`VITE_IDLE_WARNING_SECONDS`). Verificado: los 3 usuarios con su rol, una fila
`login` y una `logout` por usuario con su `reason`, e índice TTL de 90 días. Al cerrar: backend 39 unit /
41 e2e, frontend 202 tests.

**Límites que deja:** `logout` vive en `AuthSessionController` aparte (límite de líneas); si Mongo falla al
auditar, `devLogin` y `logout` fallan y el frontend limpia la sesión igual; `AUTH_EVENT_RETENTION_DAYS`
inválido cae a 90 sin aviso (por decidir si debe fallar el arranque); un logout `expired` solo se registra si
el JWT aún es válido; sin `trust proxy`, `ip` es la del proxy (DT-023); durante el aviso de inactividad solo
"Seguir conectado" lo cancela; `httpClient` no tiene timeout.

**Pendiente:**
- [ ] Ver en navegador el aviso a los 360 s y la salida a `/login` (DT-010).
- [ ] DT-022 (los e2e dejan filas `u-1` en `auth_events`, origen sin confirmar), DT-023 y DT-024 (esta última
      resuelta en código por la Etapa 2; se cierra tras revisar las pantallas).
- DT-018 y DT-019 siguen abiertas: las cierran AUTH-3 y AUTH-4.

---

## OBS-1 — FlowLog: trazas de flujo request → adapters → response (LOW)

**Estado:** ✅ cerrado en código (2026-10-27) · **Complejidad:** 🟢 Baja

Código en `apps/backend/src/shared/observability/`. Apagado por defecto (`FLOW_LOG_ENABLED=false`), falla
cerrado y nunca con `NODE_ENV=production`. Para verlo: `FLOW_LOG_ENABLED=true` en el `.env` local,
`podman-compose up -d --force-recreate backend` y `podman-compose logs -f backend`. Qué oculta y cómo trazar
un adapter nuevo: `.claude/rules/backend-architecture.md` → Logging.

**Pendiente:** OBS-2 (sección Mongo con flag propio `FLOW_LOG_MONGO` y/o `mongod --quiet`, por decidir),
DT-020 (warnings de lint del FlowLog) y DT-021 (el `Dockerfile` fija `NODE_ENV=production`; decidir en DEPLOY-1).

---

## Cambios a este roadmap

- Cualquier reordenamiento se discute y queda registrado aquí (fecha + razón).
- Una idea nueva sin plan de ejecución se agrega como feature con estado 📌, aunque falte completar secciones.

### Historial

| Fecha | Cambio | Razón |
| --- | --- | --- |
| 2026-09-13 | Roadmap inicial, migrado del plan de arquitectura original (archivado). | Hacía falta un backlog vivo por feature, distinto del plan etapa-por-etapa del refactor frontend. |
| 2026-09-13 | Etapa 1 de FE cerrada (`LoginPage.tsx`, DT-001). | Cierre verificado con lint, typecheck, 97 tests, `validate-quality` y Playwright. |
| 2026-09-13 | Agregado `FE-OTP-1` antes de AUTH-2 y de la Etapa 2; `AUTH-2` pasa de password a OTP (Media → Alta). | Decisión de producto: OTP por correo `@ibm.com` reduce superficie de ataque; reabre `LoginForm` como cambio de alcance. |
| 2026-10-15 | Reordenado: `QW-1`, Etapas 2-3, `AUTH-1` y `PROC-2` delante de `FE-OTP-1`; `CV-1` candidato a adelantarse. | Demo al sponsor con un vertical real con backend; CI y navegación de la demo estaban rotos. |
| 2026-10-15 | Arquitectura objetivo IBM Cloud (ADR-006 a ADR-012): Code Engine en `br-sao`, sin Redis, watsonx.ai por `CvAnalysisPort`, email por `EmailSenderPort`; `DEPLOY-1` con alcance concreto. | Decisiones sobre deploy, región y reemplazo de Watson NLU/Event Notifications/Redis que no tenían ADR y contradecían el código. |
| 2026-10-15 | Modelo de dominio cerrado (ADR-013): `shared-types` actualizado, entidad `Report`, regla de consistencia `Candidate`↔`Process`; resuelta la contradicción de acceso a `/feedback`. | Al validar roles se vio que el modelo nunca se completó; se modeló antes de construir PROC-2, CAND-1, INT-1, FEED-1 y REP-1. |
| 2026-10-18 | Creado `docs/use-cases/` (casos de uso por rol y feature); señalada sin resolver la discrepancia de acceso de PM en `/processes/new`. | La especificación de "quién puede hacer qué" estaba repartida entre 3 documentos sin casos negativos. |
| 2026-10-18 | `AUTH-1` backend cerrado y verificado contra el proceso real; bug de `@Prop` sin `type: String` en uniones corregido. | Primer backend real; el bug pasó todos los tests y solo apareció al arrancar el proceso (verificación independiente). |
| 2026-10-24 | `AUTH-1` cerrado en código: swap de `auth.infra.ts`, test de integración contra Mongo, DT-008 y DT-009 resueltos, `THROTTLE_TTL` corregido a ms. | La revisión halló `dev-login` abierto sin `NODE_ENV` y sesión muerta con token vencido; se resolvieron antes de PROC-2/DEPLOY-1. |
| 2026-10-24 | Hardening de sesión del frontend: DT-017 (401 tardío), DT-015 (caché por sesión), DT-016 (JWT vencido tras F5); 146 → 178 tests. | La revisión de AUTH-1 señaló tres casos latentes que se vuelven reales con los primeros `useQuery`. |
| 2026-10-25 | Limpieza de documentación legacy (alcance A): `legacy_docs/` fuera del contexto del agente, C4 de otro producto eliminado, ADR-004/009/013 pendientes de reemplazo. | Aislar lo obsoleto antes de rediseñar el dominio (alcance B, pendiente). |
| 2026-10-27 | Registradas `QW-2`, `AUTH-3` y `AUTH-4`; altas DT-018 y DT-019. | El logout solo borraba estado del cliente y la sesión no caducaba por inactividad. |
| 2026-10-27 | `OBS-1` cerrado en código: FlowLog apagado por defecto y nunca en producción; alta DT-020. | Ver el flujo request → adapter → response sin tocar cada capability ni arriesgar producción. |
| 2026-10-27 | `QW-2` cerrado en código (`a1c5b96`, `1341f8a`, `666fcf0`, `71cb074`) y verificado con curl + Mongo; altas DT-022, DT-023, DT-024. | Falta el recorrido en navegador (DT-010); DT-018 y DT-019 siguen abiertas. |
| 2026-10-28 | Etapa 2 de FE cerrada en código (`dd77ff8`, `2ef1a5b`, `0326925`), **pendiente de revisión en navegador (DT-010)**; 264 tests y 0 críticos en `validate-quality`. | Cierra el único crítico (DT-002) y alinea el shell y el Inicio con `UX-GUIDELINES.md`; DT-002/007/024 se resuelven tras revisar las pantallas. |
| 2026-10-28 | `ROADMAP.md` adelgazado: encuadre anterior archivado en `legacy_docs/`, FE-OTP-1 movida a `docs/use-cases/auth.md`, tabla de equivalencias Bench First. | Preparar el replanning Bench First; el detalle sigue en git, `docs/use-cases/` y `legacy_docs/`. |
| 2026-10-30 | `BENCH-1` implementado en código (backend, frontend y casos de uso), **falta verificación en vivo**; altas DT-027 a DT-029; los tipos de `shared-types` llevan prefijo I/T/E. | Primer dato de negocio real de Bench First, base de `MATCH-1`. |
| 2026-10-28 | Fuentes de verdad consolidadas: `.clinerules` pasa a puntero, el estado actual se mueve de `CLAUDE.md` a este archivo y `PROJECT_CONTEXT.md` se reparte entre sus dueños y queda como puntero (el dominio anterior se archiva). | Una única fuente de verdad por tema; tokens de diseño: manda el código de Tailwind (DT-026). |
| 2026-10-30 | `BENCH-1` verificado en vivo (stack con podman, `curl` por rol, imagen de producción); `ROADMAP.md` reordenado con lo pendiente arriba y lo cerrado al final. | Que el documento muestre primero qué toca hacer; solo queda el recorrido en navegador con los 3 roles. |

---

_Ver también: [`CLAUDE.md`](./CLAUDE.md) para las invariantes ·
[`docs/architecture/README.md`](./docs/architecture/README.md) para las decisiones ·
[`good-practices/DEBT_TECH.md`](./good-practices/DEBT_TECH.md) para la deuda técnica._

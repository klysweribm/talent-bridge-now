# Roadmap — Features Planeados

> Backlog priorizado de features. Cada feature tiene: motivación, alcance,
> dependencias, complejidad estimada y estado. El orden refleja la secuencia
> de implementación recomendada — feature completo en frontend primero, su
> backend después (principio acordado en el plan de remediación) — y puede
> reajustarse por urgencia real, no preferencia teórica.
>
> Este roadmap NO repite el detalle etapa-por-etapa del refactor frontend en
> curso (eso vive en el plan de remediación, ver `CLAUDE.md` → "Estado actual
> / próximo paso"). Aquí se trackea la feature completa (frontend + backend +
> deploy) a nivel de producto, y es donde se anota una idea nueva cuando
> surge, aunque todavía no tenga hueco en ningún plan de ejecución.
>
> **Última actualización:** 2026-10-15 (reordenado para demo al sponsor: QW-1 + vertical de procesos real antes de FE-OTP-1; agregados QW-1 y AUTH-1)

---

## Leyenda

| Símbolo  | Significado                                                     |
| -------- | ---------------------------------------------------------------- |
| 🟢 Baja  | 1-2 días, sin dependencias fuertes                                |
| 🟡 Media | 3-5 días, requiere diseño previo o coordinación con otra feature |
| 🔴 Alta  | 6+ días, requiere integración externa (IBM Cloud) o varias capas |
| 📌       | Sin arrancar                                                      |
| 🚧       | En progreso                                                       |
| ✅       | Completado                                                        |

---

## Orden de implementación recomendado

```
Ahora        →  QW-1 · Quick wins: gates verdes, demo robusta, fundaciones   🚧 en progreso
En curso     →  FE   · Remediación frontend — Etapa 2 (dashboard) y 3 (wizard + detalle)  🚧 Etapa 1/8 cerrada
Iteración 1  →  AUTH-1 · Login de desarrollo con JWT real (usuarios sembrados)  📌 sin arrancar
Iteración 2  →  PROC-2 · Backend de procesos + wizard (vertical real demo)   📌 sin arrancar
Iteración 3  →  FE-OTP-1 · Login OTP por correo (frontend, mock-first)       📌 sin arrancar
Iteración 4  →  AUTH-2 · Backend real OTP (reemplaza emisión de AUTH-1)       📌 sin arrancar
Iteración 5  →  CAND-1 · Feature Candidatos (frontend + backend)              📌 sin arrancar
Iteración 6  →  FEED-1 · Feature Feedback (frontend + backend)                📌 sin arrancar
Iteración 7  →  CV-1   · Análisis de CV (Watson NLU + IBM COS) — candidato a adelantarse si el sponsor pide IA  📌 sin arrancar
Iteración 8  →  INT-1  · Feature Entrevistas (frontend + backend)             📌 sin arrancar
Iteración 9  →  REP-1  · Feature Reportes (frontend + backend)                📌 sin arrancar
Iteración 10 →  HARDEN-1 · Endurecimiento transversal final                   📌 sin arrancar
Iteración 11 →  DEPLOY-1 · Deploy real en IBM Cloud                           📌 sin arrancar
```

> **Reordenamiento 2026-10-15 (demo al sponsor):** el objetivo inmediato es un
> **vertical real con backend** del flujo de procesos (dashboard → crear
> proceso → detalle, persistido en MongoDB). Por eso QW-1 + Etapas 2-3 +
> AUTH-1 + PROC-2 pasan delante de FE-OTP-1: el login es la pantalla menos
> diferenciadora, y AUTH-1 entrega el JWT real que PROC-2 necesita sin esperar
> OTP + Event Notifications. La justificación original de abajo se conserva
> como referencia; donde contradice este bloque, manda este bloque.

**Justificación del orden:**

- **FE-OTP-1 se inserta antes de AUTH-2 y antes de continuar con Etapa 2 (dashboard)** —
  cambia el punto de entrada de toda la app (login). Conviene estabilizar ese
  flujo ahora, con el organism `LoginForm` todavía "caliente" de la Etapa 1,
  en vez de seguir construyendo features (dashboard, wizard) sobre un login
  que ya se sabe se va a reemplazar. Es frontend-only (mock-first, sin
  backend), no bloquea nada del resto del roadmap salvo el alcance de AUTH-2,
  y su costo (🟡 Media, ~2-3 días) es bajo comparado con el riesgo de dejarlo
  para después y tener que retrabajar dos veces el mismo organism.
- **FE primero** — sin un golden path frontend sólido (atoms/molecules/organisms
  correctos, `infrastructure/` mock-first, tests) cada feature nueva repetiría
  los mismos problemas que forzaron el plan de remediación. El resto del
  roadmap asume ese patrón ya validado.
- **AUTH-2 después de FE-OTP-1** — el login OTP mock ya funciona en UI;
  conectar el backend real (Redis + IBM Event Notifications + JWT) es la
  dependencia más barata de resolver antes de que el resto de features
  necesite un token real para sus endpoints.
- **PROC-2 sigue a AUTH-2** — procesos es el corazón del dominio (crear
  proceso → asignar referente → candidatos), y todo lo demás (entrevistas,
  feedback, reportes) cuelga de un `processId` existente.
- **CAND-1 antes de INT-1** — no se puede agendar una entrevista sin un
  candidato cargado; el dedupe por email y el banco de perfiles son
  prerequisito funcional.
- **INT-1 antes de FEED-1** — el feedback técnico se llena post-entrevista;
  sin el flujo de agendamiento no hay entrevista que dispare el feedback.
- **REP-1 al final del ciclo de features** — el reporte al cliente consolida
  candidatos + entrevistas + feedback; es el punto de salida del proceso.
- **CV-1 es independiente pero de baja prioridad relativa** — mejora la
  carga de candidatos (pre-llenado automático) pero el flujo funciona sin
  ella (carga manual). Se puede adelantar si sobra tiempo en cualquier
  iteración de CAND-1 en adelante.
- **HARDEN-1 antes de DEPLOY-1** — gate de CI, decisión sobre `@carbon/react`,
  env config tipado y error boundary deben cerrarse antes de exponer la app
  fuera de local/Docker.

---

## QW-1 — Quick wins previos a la demo (gates, robustez, fundaciones)

**Estado:** 🚧 en progreso · **Complejidad:** 🟢 Baja (2-3 días)

**Implementado (2026-10-15):** gates (atoms DT-003…DT-006, ESLint + specs + e2e + Dockerfile de prod en backend, CI en Node 22 con `validate-quality` informativo), demo robusta (navegación única, `ComingSoon`/404 en layout, `ErrorBoundary`, sesión persistida, usuarios demo `ana@`/`carlos@`/`mariana@ibm.com`), fundaciones (`shared-types` en frontend, `env.ts`, `httpClient`, Mongoose/helmet/throttler/health con DB), higiene. Frontend 97 → 143 tests; backend 0 → 5 tests. **Pendiente:** recorrido manual en navegador (F5, 3 roles, sin 404) y health contra Mongo real. `shared-types` en backend se movió a PROC-2 (el contexto Docker del backend no incluye `packages/`). El lint del frontend en CI sigue en rojo hasta la Etapa 2 (DT-002 + warnings de `SidebarNav`).

### Motivación

Validación 2026-10-15: lint frontend en rojo (5 errores `max-lines`), CI backend
roto (sin ESLint config, sin specs, sin Dockerfile de prod), botones de la demo
que terminan en 404, sesión que se pierde con F5, login mock con un único rol,
`packages/shared-types` sin consumir. Nada de eso resiste una demo en vivo.

### Alcance

- Gates: atoms DT-003…DT-006 bajo límite; backend con ESLint, primer spec, e2e y Dockerfile de prod; `validate-quality` en CI; Node alineado; sin passwords hardcodeadas en `docker-compose.test.yml`.
- Demo robusta: config de navegación única (router + sidebar), `ComingSoon`/404 dentro del layout, `ErrorBoundary`, sesión persistida en `sessionStorage`, usuarios demo por rol.
- Fundaciones: `shared-types` conectado en ambas apps, `config/env.ts` + `httpClient` en frontend, Mongoose/helmet/throttler/Logger/health con DB en backend.
- Higiene: READMEs correctos, `.DS_Store` fuera de git, decisión `@carbon/react` registrada (ver HARDEN-1).

### Dependencias

Ninguna.

### Criterios de éxito

- [x] Lint frontend con solo el error de `DashboardPage` (DT-002, se cierra en Etapa 2); lint/typecheck/test backend verdes.
- [ ] Ningún link de sidebar/dashboard lleva a 404; ruta inexistente muestra 404 dentro del layout (✅ por tests de `AppRouter`; falta recorrido en navegador).
- [ ] F5 no cierra sesión; se puede entrar con los 3 roles demo (✅ por tests; falta recorrido en navegador).
- [x] `shared-types` importado desde el frontend con typecheck verde (backend → PROC-2).
- [ ] `httpClient` + `config/env.ts` con tests ✅; backend conecta a Mongo y `/api/v1/health` reporta su estado (verificado con Mongo caído vía podman; falta con Mongo arriba).

---

## AUTH-1 — Login de desarrollo con JWT real (usuarios sembrados)

**Estado:** 📌 sin arrancar · **Complejidad:** 🟢 Baja

### Motivación

PROC-2 necesita endpoints protegidos con un JWT real. Esperar a AUTH-2 (OTP +
Redis + Event Notifications) bloquearía el vertical de la demo. AUTH-1 entrega
el contrato de JWT/roles definitivo; AUTH-2 solo cambia **cómo** se emite.

### Alcance

- `POST /api/v1/auth/dev-login` (email de un usuario sembrado → JWT con rol), **deshabilitado si `NODE_ENV=production`**.
- `JwtAuthGuard` + decorador `@Roles` en `shared/`, reutilizables por todas las capabilities.
- Seed de usuarios demo (recruiter / technical / pm).
- Frontend: `auth.infra.ts` pasa de mock a `httpClient` manteniendo la UI de Etapa 1.

### Dependencias

QW-1 (Mongoose + `httpClient` + `shared-types`).

### Criterios de éxito

- [ ] Login con los 3 usuarios sembrados devuelve JWT con el rol correcto.
- [ ] El endpoint responde 404 con `NODE_ENV=production` (test).
- [ ] Endpoint protegido sin token → 401; rol incorrecto → 403 (tests).

---

## FE — Remediación frontend (auth + processes)

**Estado:** 🚧 en progreso (Etapa 1/8 cerrada) · **Complejidad:** 🔴 Alta (multi-etapa)

### Motivación

Ver plan de remediación (`~/.claude/plans/breezy-moseying-plum.md`) y
`CLAUDE.md` → "Estado actual / próximo paso" para el detalle completo. Este
roadmap no lo duplica porque es un plan de ejecución vivo, no un feature
discreto — se referencia aquí solo para dar contexto de por qué el resto de
features esperan a que cierre.

### Dependencias

Ninguna — es la base de todo lo demás.

### Criterios de éxito

- [x] Etapa 0 — fundaciones de calidad (lint/typecheck/tests/validate-quality funcionando)
- [x] Etapa 1 — refactor `LoginPage.tsx` (golden path `auth`, DT-001 resuelto, verificado visualmente con Playwright)
- [ ] Etapa 2 — refactor `DashboardPage.tsx` + `SidebarNav.tsx`
- [ ] Etapas 3-7 — wizard/detalle de procesos + features `candidates`/`interviews`/`feedback`/`reports` desde cero (solo UI, sobre mocks)
- [ ] Etapa 8 — endurecimiento transversal (CI gate, decisión `@carbon/react`, env config, error boundary)

---

## FE-OTP-1 — Login OTP por correo corporativo + panel de marca (Frontend, mock-first)

**Estado:** 📌 sin arrancar · **Complejidad:** 🟡 Media-Alta (3-4 días) · **Prioridad:** Alta — próximo paso recomendado, antes de continuar con Etapa 2 (dashboard)

### Motivación

Análisis arquitectónico (sesión 2026-09-13, ver historial de conversación /
`plan-arquitectonico.md`): para una plataforma interna IBM sin candidatos con
login, autenticar por posesión del correo `@ibm.com` (OTP/magic code) es más
simple y reduce superficie de ataque frente a usuario+contraseña — sin hashing,
sin reset flows, sin credenciales débiles. Decisión: implementar OTP propio
ahora (Redis + IBM Event Notifications, ambos ya en el stack) y dejar la
migración a IBM App ID/SSO w3id para Fase 2, sin romper el contrato de JWT
interno cuando eso ocurra.

Este task **reemplaza** el flujo de contraseña construido en la Etapa 1 del
plan de remediación frontend (DT-001, ya cerrado) — no es trabajo aditivo,
es un ajuste de alcance sobre un organism ya cerrado (`LoginForm`), más un
rediseño de layout de `LoginPage` (panel de marca). Se documenta aquí como
feature de producto porque cambia el flujo y la página, no como deuda
técnica nueva.

**Mockup recibido y confirmado** (sesión 2026-09-13, 2 capturas: estado
inicial "correo" y estado "código"). Decisiones cerradas sobre lo mostrado
en el mockup:

- ❌ **Sin fallback a contraseña.** El mockup incluye un link "¿Prefieres
  usar contraseña tradicional?" — **se descarta**. OTP es el único método
  además de SSO, consistente con el argumento de seguridad original
  (eliminar contraseñas, no mantener dos flujos paralelos). No se construye
  ese link ni un modo "password" en `LoginForm`.
- ✅ **Panel de marca (hero) sí se construye**, con el testimonial/stats
  del mockup ("Elena Morales", "94% coincidencia técnica", "+1,200 procesos
  2024") **marcados explícitamente como contenido placeholder** en el
  código (comentario `// PLACEHOLDER: contenido de ejemplo, reemplazar
  antes de un ambiente visible fuera del equipo`) y en este ítem del
  roadmap — no se documenta como copy final aprobado.
- ✅ **Un solo task** — el panel de marca entra en este mismo `FE-OTP-1`
  (no se separa en un task aparte), aunque es funcionalmente independiente
  del flujo de autenticación.

### Alcance (estrictamente frontend, sobre mocks — sin backend real)

**A. `LoginPage.tsx` — nuevo layout de dos columnas (`components/pages/`)**

- Grid de 2 columnas en desktop (`lg:grid-cols-2`), colapsa a una sola
  columna en mobile (el panel de marca se oculta u ordena debajo — decidir
  al implementar cuál es menos disruptivo; el mockup no cubre el breakpoint
  mobile). Columna izquierda: `AuthBrandPanel`. Columna derecha: `LoginForm`
  + `AuthFooter` (composición ya existente, sin cambios de esa parte).
  `DotMatrixBackdrop` se mantiene solo detrás de la columna derecha (el
  panel izquierdo ya tiene su propio fondo degradado).

**B. Nuevo organism `AuthBrandPanel`** (`features/auth/components/organisms/AuthBrandPanel/`)

Puramente presentacional — no toca stores ni React Query, todo por
composición estática (podría ser Page-level directamente, pero se deja como
organism para poder testear su render por separado y por consistencia con
el resto del árbol). Compone:

- **Molecule nueva `ConsultingBadge`** — logo "CONSULTING" + badge
  "Global Talent Cloud" (header del panel).
- **Molecule nueva `BrandHeroHeadline`** — tag "Plataforma de Talento
  Estratégico" + titular "Conectando el mejor talento tecnológico con el
  futuro de IBM Consulting."
- **Molecule nueva `TestimonialCard`** — avatar iniciales + nombre + rol +
  badge "IBM Verified". **Contenido placeholder marcado en código.**
- **Molecule nueva `ProductPreviewMock`** — el "mockup dentro del mockup"
  (panel oscuro simulando un dashboard) + overlay de stats (`StatChip`
  ×2: "94% +4.2% Coincidencia técnica promedio", "+1,200 Procesos 2024").
  Puramente decorativo — imagen o composición CSS, no datos reales, no
  `useQuery`. **Contenido placeholder marcado en código.**
- **Molecule nueva `AuthBrandFooter`** — "Impulsado por IBM Watson
  Orchestrate & Carbon Design" + "Enterprise Auth Guard · 256-bit".
- Límite de 100 líneas de organism — si no entra componiendo directo,
  repartir en los 5 molecules de arriba (que sí es el plan) y dejar el
  organism solo como composición.

**C. `LoginForm` — máquina de 2 pasos (mismo archivo, se reemplaza el contenido):**

- **Paso "email"**: banner nuevo "Acceso sin contraseña mediante código
  OTP" (reemplaza `ProfileDetectionBanner` en este flujo — evaluar si
  `ProfileDetectionBanner` queda sin uso o se generaliza), `EmailField`
  (sin cambios, reusa icono + sufijo `@ibm.com`), texto ayuda "Se enviará
  un código temporal de 6 dígitos válido por 10 minutos", checkbox
  **"Recordar este correo en este dispositivo corporativo"** (`remember-email`
  — solo autocompletar el email la próxima vez, no afecta el requerimiento
  de OTP), botón "Enviar código de verificación". Al enviar, dispara
  `requestOtp` y avanza de paso si el mock resuelve OK.
- **Paso "código"**: chip de cuenta (avatar iniciales + email + "Cambiar
  cuenta" — vuelve al paso "email", limpia el código), banner "Verificación
  en dos pasos (2FA / OTP)", `OtpCodeField` (nueva molecule, 6 casillas)
  + `ResendOtpControl` (nueva molecule, countdown "Reenviar en 00:45"),
  checkbox **"Confiar en este dispositivo corporativo por 30 días"**
  (`trust-device` — distinto del checkbox del paso 1, ver nota abajo),
  botón "Verificar y Acceder". Al enviar, dispara `verifyOtp`; en éxito,
  mismo contrato de siempre (`setAuth` + `navigate('/dashboard')`).
- **`PasswordField` se retira del árbol de `LoginForm`** sin fallback (ver
  decisión cerrada arriba) — el archivo puede quedar sin uso; revisar
  referencias antes de decidir si se borra o se conserva para un eventual
  login de administración fuera de este flujo.
- **Nota — no confundir los dos checkboxes**: `remember-email` (paso 1,
  cosmético, solo autocompletar) vs `trust-device` (paso 2, afecta si se
  vuelve a pedir OTP en el próximo login) son estados distintos con
  distinto impacto funcional — nombrarlos así en el código para que la
  diferencia sea obvia a quien lea el organism.
- **Elementos del mockup que NO se construyen en este MVP** (prometen
  capacidades que no existen todavía — SSO/App ID es Fase 2): badge
  "IBM Verify" junto a "Código de verificación", el link "Probar otro
  método de verificación (YubiKey / IBM Push)", y la frase "enviado a tu
  aplicación de autenticación o correo corporativo" (se ajusta el copy a
  "enviado a tu correo corporativo" — solo email, sin insinuar canal app).
  No se ocultan disabled ni se dejan a medias: simplemente no forman parte
  de esta versión del componente.
- Límite de 100 líneas de organism aplica igual — si la máquina de 2 pasos
  no entra, extraer el paso "código" a un sub-organism (`OtpVerificationStep`)
  en vez de forzar el límite.

**Hooks nuevos en `features/auth/hooks/`:**

- `useRequestOtp.ts` — `useMutation` sobre `requestOtp(email)`; ≤ 60 líneas.
- `useVerifyOtp.ts` — `useMutation` sobre `verifyOtp({email, code})`; en éxito
  `setAuth` + `navigate`; ≤ 60 líneas.
- Estado de paso (`'email' | 'otp'`), el `email` ya ingresado, y los dos
  checkboxes (`remember-email`, `trust-device`) son **client-generated y
  efímeros** — `useState` local dentro de `LoginForm` (organism, capa
  permitida para estado), **no** amerita un Zustand store nuevo.

**Infrastructure — extender `features/auth/infrastructure/auth.infra.ts`:**

- `requestOtp({ email }): Promise<{ sent: true }>` — mock-first, simula
  latencia (`setTimeout` ~600ms), valida dominio `@ibm.com` (mismo mensaje de
  error que hoy), rechaza si no es `@ibm.com`.
- `verifyOtp({ email, code }): Promise<{ user, token }>` — mock-first, simula
  latencia, código mock fijo para pruebas (ej. `'123456'` siempre válido, o
  cualquier secuencia de 6 dígitos que empiece en un rango — decidir el mock
  más simple), resuelve `{user, token}` igual que el `loginUser` actual o
  rechaza con `Error('Código incorrecto o expirado.')`.
- `loginUser` (password) queda sin consumidor tras retirar el fallback —
  eliminarlo del archivo si al implementar se confirma que nada más lo usa
  (no dejar código muerto sin razón, a diferencia de la decisión anterior).

**Tests:**

- Reemplazar (no sumar) los tests de password en `LoginForm.test.tsx` /
  `LoginPage.test.tsx` por el flujo de 2 pasos: envío de correo válido/inválido,
  avance de paso, código incorrecto (sin avanzar), código correcto (redirect
  + `setAuth`), reenvío respeta cooldown, "cambiar correo"/"cambiar cuenta"
  vuelve al paso 1, los dos checkboxes cambian de estado independientemente.
- Tests unitarios nuevos para `OtpCodeField` (paste de 6 dígitos, solo
  numérico, avance de foco), `ResendOtpControl` (countdown, disabled state),
  y render de `AuthBrandPanel` (smoke test — que renderice sin crashear,
  no hay lógica que testear más allá de eso).

### Explícitamente fuera de alcance (va a AUTH-2, backend, ver abajo)

Generación real de OTP, hashing/almacenamiento en Redis con TTL, rate
limiting, lockout por intentos fallidos, envío real vía IBM Event
Notifications, y el mecanismo de provisión de usuarios/roles (whitelist de
correos con rol asignado). Nada de esto se toca en este task — el mock en
`infrastructure/` es la interfaz que ese trabajo backend va a implementar
después, sin tocar componentes ni hooks de este task (mismo principio
mock-first que ya se siguió en Etapa 1).

### Dependencias

Etapa 1 de FE (cerrada) — reemplaza parte de su organism, no depende de nada
nuevo. No depende de AUTH-2 ni de ningún backend.

### Riesgo / nota de arquitecto

Reabre parcialmente un organism que se dio por cerrado (DT-001) y agrega una
página/layout nuevo (`AuthBrandPanel`). Es una decisión de producto
consciente, no deuda técnica — se documenta aquí y no en `DEBT_TECH.md` para
no mezclar "cambio de alcance aprobado" con "código que quedó mal". El
contenido placeholder del panel de marca (testimonial/stats) es un recordatorio
pendiente — no cerrar este ítem del roadmap como 100% terminado en producción
sin volver a decidir ese copy. Al cerrar este task, actualizar `CLAUDE.md` →
"Estado actual / próximo paso" para reflejar que Etapa 1 ahora incluye este
ajuste, y `good-practices/DEBT_TECH.md` si algún archivo nuevo queda por
sobre su límite de línea.

### Criterios de éxito

- [ ] Flujo completo mockeado: ingresar `@ibm.com` → "código enviado" →
      ingresar código válido → redirige a `/dashboard` con `setAuth` (mismo
      contrato de salida que el login actual).
- [ ] Correo no `@ibm.com` bloquea el paso 1 con error de validación (zod),
      igual que hoy.
- [ ] Código incorrecto muestra error sin avanzar de paso ni perder el email
      ingresado.
- [ ] "Reenviar código" respeta un cooldown visual — no se puede spamear el
      mock en loop.
- [ ] "Cambiar correo"/"Cambiar cuenta" vuelve al paso 1 limpiando el estado
      del código.
- [ ] No existe ningún link ni UI de "iniciar sesión con contraseña" en el
      árbol renderizado.
- [ ] No existen badges/links de "IBM Verify" ni "YubiKey / IBM Push" en el
      árbol renderizado (fuera de alcance de este MVP).
- [ ] Panel de marca (`AuthBrandPanel`) visible en desktop, con contenido
      placeholder marcado con comentario en el código.
- [ ] Layout de 2 columnas no rompe en mobile (~400px) — el panel de marca
      se oculta o reordena sin generar scroll horizontal.
- [ ] Ningún archivo nuevo excede su límite de línea (`validate-quality.mjs --strict`).
- [ ] `npm run typecheck` / `npm run lint` / `npm test` en verde en `apps/frontend`.
- [ ] Verificación visual manual o con Playwright del flujo completo (2
      pasos, error, éxito, panel de marca en desktop y mobile) antes de
      cerrar — mismo criterio aplicado en Etapa 1.

---

## AUTH-2 — Backend real de autenticación OTP (JWT end-to-end)

**Estado:** 📌 sin arrancar (backlog — no iniciar hasta que FE-OTP-1 cierre) · **Complejidad:** 🔴 Alta

### Motivación

El login hoy es (o será, tras FE-OTP-1) una simulación de OTP en frontend
(`features/auth/infrastructure/auth.infra.ts`). Sin backend real no hay forma
de emitir un código verdadero, protegerlo contra fuerza bruta, ni de que el
guard de rol (`AppRouter.tsx`) refleje una sesión real en vez de un mock en
Zustand.

### Alcance

- `capability/auth`: `POST /auth/otp/request`, `POST /auth/otp/verify`,
  `POST /auth/refresh`, `POST /auth/logout`.
- **Generación y almacenamiento de OTP**: código de 6 dígitos criptográficamente
  aleatorio, **hasheado** antes de guardar en Redis (no texto plano), TTL de
  ~10 min, invalidar el código anterior al solicitar uno nuevo para el mismo
  correo.
- **Rate limiting / anti-brute-force**: máximo N solicitudes de OTP por
  email/IP en X minutos; lockout tras M intentos de verificación fallidos
  para el mismo código/sesión.
- **Envío real**: IBM Event Notifications (HTTP API, ya en el stack) con
  template de email dedicado en `packages/email-templates` (HTML plano, sin
  scripts, según regla del monorepo).
- **Provisión de usuarios/roles**: mecanismo para pre-registrar correos con
  rol asignado (`recruiter` | `technical` | `pm`) — sin esto, un login OTP
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
      guardar en Redis, y lo envía por IBM Event Notifications.
- [ ] `POST /auth/otp/verify` rechaza código incorrecto/expirado/reusado con
      401, y aplica lockout tras N intentos fallidos.
- [ ] Rate limiting verificado: solicitar OTP repetidamente en un corto
      período es rechazado antes de llegar a enviar email.
- [ ] Existe un mecanismo (aunque sea manual/admin de datos) para asignar rol
      a un correo antes de su primer login.
- [ ] Un endpoint protegido con `@Roles('recruiter', 'pm')` rechaza a
      `technical` con 403.
- [ ] El guard de `AppRouter.tsx` sigue funcionando sin cambios de contrato
      (mismo `UserRole`).
- [ ] El código OTP nunca aparece en logs ni responses en texto plano.

---

## PROC-2 — Backend de procesos + wizard

**Estado:** 📌 sin arrancar · **Complejidad:** 🔴 Alta

### Motivación

El wizard de creación de proceso (Etapa 3 del plan FE) y el dashboard
(Etapa 2) hoy corren sobre mocks. Este feature es el dominio central:
crear proceso, asignar referente técnico, cargar candidato con validación
de duplicado por email.

### Alcance

- `capability/processes`: `POST /processes`, `PATCH /processes/:id`, `GET /processes`, `GET /processes/:id`.
- `GET /users/referents?specialty=...` — listar referentes filtrables por especialidad (consumido por el paso 2 del wizard).
- `POST /candidates` con validación de duplicado por email (índice único ya definido en `PROJECT_CONTEXT.md`).
- Frontend: `processes.infra.ts` y `wizard.store.ts` (Etapa 3) pasan de mock a `fetch` real.

### Dependencias

AUTH-2 (endpoints protegidos por rol) · FE Etapas 2-3 (UI y `infrastructure/` mock-first ya existentes).

### Criterios de éxito

- [ ] Se puede crear un proceso completo end-to-end (los 4 pasos del wizard persisten en backend).
- [ ] Cargar un candidato con email duplicado devuelve error claro, no crea registro.
- [ ] Dashboard muestra datos reales de `GET /processes`, no `MOCK_PROCESSES`.

---

## CAND-1 — Feature Candidatos

**Estado:** 📌 sin arrancar · **Complejidad:** 🟡 Media

### Motivación

`features/candidates/` existe como scaffold vacío (`infrastructure/` ya
renombrado en Etapa 0). Es el banco de perfiles que consumen reclutador y PM.

### Alcance

- Frontend: estructura completa `components/{atoms,molecules,organisms,pages}`, banco de perfiles + detalle de candidato, filtros de UI (client-state en `store/` solo si aplica).
- Backend: `GET /candidates` (paginado, nunca query sin límite — regla de `.clinerules`), `GET /candidates/:id`, `PATCH /candidates/:id`.

### Dependencias

PROC-2 (los candidatos nacen asociados a un proceso vía `POST /candidates` del wizard) — este feature completa el CRUD y la vista de banco de perfiles standalone.

### Criterios de éxito

- [ ] Banco de perfiles lista candidatos con paginación real.
- [ ] Detalle de candidato muestra su historial de procesos.
- [ ] Sigue el golden path de `good-practices/examples/frontend/` (mock-first → luego backend real, sin tocar componentes).

---

## INT-1 — Feature Entrevistas (calendario + notificaciones)

**Estado:** 📌 sin arrancar · **Complejidad:** 🔴 Alta

### Motivación

Agendamiento de entrevistas con disponibilidad del referente técnico,
confirmación, reprogramación, export `.ics`, y notificación por email/Slack.
Es el flujo más transversal (3 roles interactúan: reclutador agenda,
referente confirma, PM observa).

### Alcance

- Backend `capability/interviews`: `POST /availability`, `GET /availability/:referentId`, `POST /interviews`, `PATCH /interviews/:id/confirm`, `PATCH /interviews/:id/reschedule`, `GET /interviews/:id/ics`.
- Backend `capability/notifications`: email al referente al agendar (IBM Event Notifications HTTP API), email de confirmación al reclutador, webhook Slack si el referente no tiene disponibilidad.
- Redis: cache de disponibilidad por referente.
- Frontend (Etapa 5 del plan FE): calendario reclutador, dashboard de disponibilidad del referente (vista matriz + lista), export `.ics` con `ical.js` (ya instalado).

### Dependencias

PROC-2 · CAND-1 (no se agenda una entrevista sin proceso ni candidato existentes) · AUTH-2 (email del referente sale del JWT/perfil).

### Criterios de éxito

- [ ] Reclutador agenda → referente recibe email → confirma o reprograma.
- [ ] `.ics` descargado abre correctamente en un cliente de calendario real.
- [ ] Sin disponibilidad cargada, el webhook de Slack se dispara (fallback documentado en `plan-arquitectonico.md`, migrado aquí).
- [ ] Timezone del referente visible en todos los componentes de horario.

---

## FEED-1 — Feature Feedback técnico

**Estado:** 📌 sin arrancar · **Complejidad:** 🟡 Media

### Motivación

Formulario de feedback post-entrevista, visible solo para Reclutador y PM
(regla ya enforced en el guard de `AppRouter.tsx` desde Etapa 0). Template
sugerido por IA según el perfil del rol, score por dimensión.

### Alcance

- Backend `capability/feedback`: `POST /feedback`, `GET /feedback/:processId`, `POST /feedback/:id/send-email`.
- Frontend (Etapa 6 del plan FE): formulario con dimensiones técnicas + soft skills, score 1-5, recomendación final (avanza / no avanza / hold).

### Dependencias

INT-1 (el feedback se dispara post-entrevista) · AUTH-2 (guard de rol real, hoy solo mockeado en Zustand).

### Criterios de éxito

- [ ] Solo `recruiter`/`pm` pueden acceder a `/feedback` (verificado con backend real, no solo el guard de frontend).
- [ ] Feedback enviado por email al candidato usa `packages/email-templates` (HTML plano, sin scripts).
- [ ] Reclutador ve resultados agregados por proceso.

---

## REP-1 — Feature Reportes

**Estado:** 📌 sin arrancar · **Complejidad:** 🟡 Media

### Motivación

Historial de reportes por proceso/candidato y generación de PDF para
enviar al cliente — el punto de salida del flujo completo.

### Alcance

- Backend `capability/reports`: `GET /reports/:processId/candidate/:id` (genera PDF), `POST /reports/:id/send` (envía por correo al cliente).
- IBM COS: bucket de reportes/CVs configurado.
- Frontend (Etapa 7 del plan FE): botón "Generar PDF" + "Enviar al cliente", historial de reportes.

### Dependencias

FEED-1 (el reporte consolida feedback + entrevistas + datos del candidato).

### Criterios de éxito

- [ ] PDF generado contiene datos reales del proceso, no placeholder.
- [ ] Envío al cliente deja registro (auditable) de cuándo y a quién se envió.

---

## CV-1 — Análisis de CV asistido (Watson NLU + IBM COS)

**Estado:** 📌 sin arrancar · **Complejidad:** 🔴 Alta

### Motivación

Idea capturada de `plan-arquitectonico.md` (semana 4): al cargar el CV de
un candidato, pre-llenar el perfil automáticamente en vez de captura manual
completa. No es bloqueante para el flujo — CAND-1 funciona con carga manual
— pero mejora significativamente la experiencia del reclutador.

### Alcance

- Backend `capability/cv-analysis`: `POST /cv/upload` (PDF/WORD a IBM COS), `POST /cv/analyze` (Watson NLU extrae datos estructurados).
- Frontend: upload en el flujo de carga de candidato (Etapa 3/CAND-1), spinner de análisis, pre-llenado del formulario con los datos extraídos (editable, nunca autocompletado silencioso).

### Dependencias

CAND-1 (se integra en el flujo de carga de candidato existente, no lo reemplaza).

### Complejidad y tamaño

**Alta** — integración con dos servicios de IBM Cloud (COS + Watson NLU) más el manejo de archivos binarios, hoy sin ningún wiring existente en el proyecto.

### Criterios de éxito

- [ ] Subir un CV real (PDF) pre-llena nombre/email/skills con precisión razonable (validar con muestra manual, no 100% automático).
- [ ] El reclutador puede corregir cualquier campo pre-llenado antes de guardar.
- [ ] Archivo original queda accesible en COS, no solo el texto extraído.

---

## HARDEN-1 — Endurecimiento transversal final

**Estado:** 📌 sin arrancar · **Complejidad:** 🟢 Baja (por ítem, varios ítems)

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

## DEPLOY-1 — Deploy real en IBM Cloud

**Estado:** 📌 sin arrancar · **Complejidad:** 🔴 Alta

### Motivación

El MVP corre hoy solo en Docker/Podman local. Falta el despliegue real
contra los servicios de IBM Cloud (Mongo, Redis, Watson, COS) documentados
en `.env.example`.

### Alcance

- Infra IBM Cloud provisionada (Mongo Atlas/Cloud Databases, Redis, COS, Watson NLU, Event Notifications).
- Variables de entorno reales en el entorno de deploy (nunca committeadas — ya cubierto por `.gitignore`).
- Pipeline de deploy (a definir: IBM Code Engine, Kubernetes Service, u otro — pendiente de decisión).

### Dependencias

HARDEN-1 (no se despliega sin el gate de CI ni la decisión de dependencias cerrada).

### Criterios de éxito

- [ ] La app es accesible por URL pública/interna IBM sin depender de `localhost`.
- [ ] Los 3 flujos críticos (crear proceso, agendar entrevista, feedback) funcionan contra servicios reales de IBM Cloud, no mocks.
- [ ] Credenciales de servicios IBM Cloud nunca en logs, responses, ni el repo.

---

## Cambios a este roadmap

- Cualquier reordenamiento se discute y queda registrado aquí (fecha + razón).
- Una idea nueva que surja sin plan de ejecución todavía se agrega como
  feature nuevo con estado 📌, aunque falte completar todas sus secciones.

### Historial

| Fecha      | Cambio                                                                                   | Razón                                                                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-13 | Roadmap inicial. Migrado el contenido de `plan-arquitectonico.md` (archivado, ver abajo). | Se necesitaba un backlog vivo por feature (motivación/alcance/dependencias/estado) distinto del plan de ejecución etapa-por-etapa del refactor frontend actual. |
| 2026-09-13 | Etapa 1 de FE marcada como cerrada (`LoginPage.tsx`/DT-001 resuelto, ver `DEBT_TECH.md`). | Cierre de etapa verificado (lint/typecheck/97 tests/`validate-quality.mjs`/verificación visual con Playwright) — próximo paso es Etapa 2 (`DashboardPage.tsx`/`SidebarNav.tsx`). |
| 2026-09-13 | Agregado `FE-OTP-1` (login OTP por correo, frontend mock-first) con prioridad Alta, insertado antes de AUTH-2 y de Etapa 2 del plan FE; `AUTH-2` actualizado de "JWT sobre password" a "JWT sobre OTP" (complejidad Media → Alta por rate limiting/lockout/provisión de roles). | Decisión de producto: reemplazar password por OTP/magic code (`@ibm.com` como factor de autenticación) para reducir superficie de ataque en una plataforma interna sin login de candidatos; migración futura a IBM App ID/SSO w3id sin romper el contrato de JWT interno. Reabre parcialmente el organism `LoginForm` de Etapa 1 — documentado como ajuste de alcance, no como deuda técnica nueva. |
| 2026-10-15 | Reordenado: `QW-1` (nuevo) + Etapas 2-3 + `AUTH-1` (nuevo) + `PROC-2` delante de `FE-OTP-1`; `CV-1` marcado como candidato a adelantarse. | Demo a un futuro sponsor IBM con un vertical real con backend (decisión del usuario): priorizar el flujo de negocio sobre el login. Validación del 2026-10-15 encontró CI frontend y backend en rojo y navegación de demo rota — se atacan primero como quick wins. |

---

_Ver también: [`CLAUDE.md`](./CLAUDE.md) → "Estado actual / próximo paso" para el punto de retoma inmediato ·
[`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) para el dominio completo ·
[`good-practices/DEBT_TECH.md`](./good-practices/DEBT_TECH.md) para deuda técnica de línea/arquitectura (no features nuevos)._

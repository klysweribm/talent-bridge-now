# Casos de uso — Autenticación

> Cubre `AUTH-1` (dev-login JWT, usuarios sembrados), `AUTH-2` (OTP real) y la
> especificación de `FE-OTP-1` (al final de este archivo). Ver `ROADMAP.md` para
> el estado de cada uno.

## Resumen de permisos

| Acción | Reclutador | Referente Técnico | PM |
| --- | --- | --- | --- |
| Login con correo `@ibm.com` provisto | ✅ | ✅ | ✅ |
| Login con correo no provisto/sin rol asignado | ❌ | ❌ | ❌ |
| Login con correo no `@ibm.com` | ❌ | ❌ | ❌ |
| Usar `/auth/dev-login` en producción (`NODE_ENV=production`) o sin `AUTH_DEV_LOGIN_ENABLED=true` | ❌ (nadie) | ❌ (nadie) | ❌ (nadie) |

## UC-AUTH-1: Login con correo provisto (AUTH-1, dev-login)

**Rol:** cualquiera de los 3, indistinto.
**Precondición:** el correo existe en el seed de usuarios demo
(`ana@`/`carlos@`/`mariana@ibm.com` — ver `CLAUDE.md`) con un `role` asignado.
**Flujo principal:** `POST /api/v1/auth/dev-login` con el email → backend
devuelve JWT con el `role` embebido → frontend guarda el token y redirige a
`/dashboard`.
**Reglas de borde / negativas:**
- `NODE_ENV=production`, o `AUTH_DEV_LOGIN_ENABLED` ausente / distinto de
  `true` exacto → el endpoint responde 404 (no existe, no 403 — no se revela
  ni su existencia) y el seed de usuarios demo no corre. Falla cerrado.
  Ver criterio de éxito de AUTH-1 en `ROADMAP.md`.
- Token vencido o inválido en cualquier llamada con sesión activa → 401; el
  frontend limpia la sesión y redirige a `/login`.
- Correo que no es `@ibm.com` → rechazado con el mismo mensaje de
  validación que ya usa `LoginForm` hoy (zod).
- Correo `@ibm.com` pero sin usuario sembrado → 401/404 explícito, nunca
  un JWT con rol vacío o default.

## UC-AUTH-2: Login con OTP real (AUTH-2)

**Rol:** cualquiera de los 3.
**Precondición:** el correo ya tiene un rol pre-asignado por el mecanismo
de provisión que define AUTH-2 (ver `ROADMAP.md` → AUTH-2, "Provisión de
usuarios/roles": colección Mongo administrada manualmente en el MVP).
**Flujo principal:** `POST /auth/otp/request` → código hasheado en Mongo
(TTL ~10 min) → email vía `EmailSenderPort` → `POST /auth/otp/verify` →
JWT + refresh token.
**Reglas de borde / negativas:**
- Correo sin rol pre-asignado → `otp/request` rechaza antes de enviar
  ningún email (no se filtra que el correo "no existe" de forma distinta
  a un correo inválido, para no dar pie a enumeración de usuarios válidos).
- Código incorrecto, expirado o ya usado → 401 en `otp/verify`.
- N intentos fallidos de verificación para el mismo código → lockout
  (contador en el propio documento Mongo del OTP, sin Redis — ADR-008).
- Solicitudes repetidas de OTP en poco tiempo para el mismo email/IP →
  rate limit (`@nestjs/throttler`), rechazadas antes de intentar enviar
  email.
- El código OTP nunca aparece en logs ni en el body de ninguna response
  (ni en caso de error).

## UC-AUTH-3: Acceso a una ruta protegida sin sesión válida

**Rol:** cualquiera.
**Precondición:** no hay JWT, o el JWT expiró.
**Flujo principal:** cualquier ruta de `navigation.ts` redirige a `/login`
(guardas ya implementadas en `router/guards/`: `ProtectedRoute`, `RoleRoute` y `PublicRoute`).
**Reglas de borde / negativas:**
- Backend: cualquier endpoint protegido sin token válido → 401 (no 403 —
  403 es para rol incorrecto con sesión válida, ver `UC-*` de cada feature).
- F5 no debe cerrar la sesión (sesión persistida en `sessionStorage`,
  criterio de éxito de QW-1 — pendiente de recorrido manual en navegador, DT-010).
- F5 con un JWT **vencido** (o malformado) → `/login` sin pintar nunca el
  contenido protegido, y la sesión persistida se limpia. Con la pantalla
  abierta, la sesión termina sola al llegar el `exp` del token.
- Al terminar la sesión (logout, 401 o vencimiento) o cambiar de usuario se
  vacía la caché de datos del frontend: el usuario B nunca ve datos de A.
- Un 401 tardío de una petición enviada con un token anterior no cierra la
  sesión nueva de un re-login.

---

## Especificación FE-OTP-1

> Movida desde `ROADMAP.md` el 2026-10-28 (adelgazamiento previo al replanning Bench First). El roadmap conserva solo un resumen con prioridad LOW. Los criterios de éxito de abajo siguen **abiertos**: se movieron de lugar, no se cerraron.

**Estado:** 📌 sin arrancar · **Complejidad:** 🟡 Media-Alta (3-4 días) · **Prioridad:** LOW

#### Motivación

Análisis arquitectónico (sesión 2026-09-13): para una plataforma interna IBM sin candidatos con
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
- ✅ **Panel de marca (hero) sí se construye, pero recortado** (ver
  `docs/design/UX-GUIDELINES.md` §3.1 — manda sobre el mockup): solo logo +
  título + **una** frase de valor. El testimonial ("Elena Morales", badge
  "IBM Verified") y el "mockup dentro del mockup" con stats ("94%
  coincidencia técnica", "+1,200 procesos 2024") **no se construyen** —
  son KPIs de vanidad / datos que no existen, igual que el resto de
  elementos recortados por `docs/design/UX-GUIDELINES.md`.
- ✅ **Un solo task** — el panel de marca entra en este mismo `FE-OTP-1`
  (no se separa en un task aparte), aunque es funcionalmente independiente
  del flujo de autenticación.

#### Alcance (estrictamente frontend, sobre mocks — sin backend real)

**A. `LoginPage.tsx` — nuevo layout de dos columnas (`components/pages/`)**

- Grid de 2 columnas en desktop (`lg:grid-cols-2`), colapsa a una sola
  columna en mobile (el panel de marca se oculta u ordena debajo — decidir
  al implementar cuál es menos disruptivo; el mockup no cubre el breakpoint
  mobile). Columna izquierda: `AuthBrandPanel`. Columna derecha: `LoginForm`
  + `AuthFooter` (composición ya existente, sin cambios de esa parte).
  `DotMatrixBackdrop` se mantiene solo detrás de la columna derecha (el
  panel izquierdo ya tiene su propio fondo degradado).

**B. Nuevo organism `AuthBrandPanel`** (`features/auth/components/organisms/AuthBrandPanel/`)

**Especificación de UX:** `docs/design/UX-GUIDELINES.md` §3.1 (manda sobre
el mockup) — alcance recortado a logo + título + una frase de valor,
**sin** `TestimonialCard` ni `ProductPreviewMock` (KPIs de vanidad / datos
inexistentes, descartados).

Puramente presentacional — no toca stores ni React Query, todo por
composición estática (podría ser Page-level directamente, pero se deja como
organism para poder testear su render por separado y por consistencia con
el resto del árbol). Compone:

- **Molecule nueva `ConsultingBadge`** — logo "CONSULTING" + badge
  "Global Talent Cloud" (header del panel).
- **Molecule nueva `BrandHeroHeadline`** — tag "Plataforma de Talento
  Estratégico" + titular "Conectando el mejor talento tecnológico con el
  futuro de IBM Consulting." + una sola frase de valor (sin testimonial,
  sin stats, sin mockup-dentro-del-mockup).
- Límite de 100 líneas de organism — si no entra componiendo directo,
  repartir en los molecules de arriba y dejar el organism solo como
  composición.

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

#### Explícitamente fuera de alcance (va a AUTH-2, backend, ver abajo)

Generación real de OTP, hashing/almacenamiento en MongoDB con índice TTL, rate
limiting, lockout por intentos fallidos, envío real por correo vía
`EmailSenderPort` (SMTP), y el mecanismo de provisión de usuarios/roles (whitelist de
correos con rol asignado). Nada de esto se toca en este task — el mock en
`infrastructure/` es la interfaz que ese trabajo backend va a implementar
después, sin tocar componentes ni hooks de este task (mismo principio
mock-first que ya se siguió en Etapa 1).

#### Dependencias

Etapa 1 de FE (cerrada) — reemplaza parte de su organism, no depende de nada
nuevo. No depende de AUTH-2 ni de ningún backend.

#### Riesgo / nota de arquitecto

Reabre parcialmente un organism que se dio por cerrado (DT-001) y agrega una
página/layout nuevo (`AuthBrandPanel`). Es una decisión de producto
consciente, no deuda técnica — se documenta aquí y no en `DEBT_TECH.md` para
no mezclar "cambio de alcance aprobado" con "código que quedó mal". El panel
de marca quedó recortado a logo + título + una frase de valor
(`docs/design/UX-GUIDELINES.md` §3.1); `TestimonialCard` y
`ProductPreviewMock` no se construyen. Al cerrar este task, actualizar `CLAUDE.md` →
"Estado actual / próximo paso" para reflejar que Etapa 1 ahora incluye este
ajuste, y `good-practices/DEBT_TECH.md` si algún archivo nuevo queda por
sobre su límite de línea.

#### Criterios de éxito

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
- [ ] Panel de marca (`AuthBrandPanel`) visible en desktop: logo + título +
      una frase de valor, sin `TestimonialCard` ni `ProductPreviewMock`
      (`docs/design/UX-GUIDELINES.md` §3.1).
- [ ] Layout de 2 columnas no rompe en mobile (~400px) — el panel de marca
      se oculta o reordena sin generar scroll horizontal.
- [ ] Ningún archivo nuevo excede su límite de línea (`validate-quality.mjs --strict`).
- [ ] `npm run typecheck` / `npm run lint` / `npm test` en verde en `apps/frontend`.
- [ ] Verificación visual manual o con Playwright del flujo completo (2
      pasos, error, éxito, panel de marca en desktop y mobile) antes de
      cerrar — mismo criterio aplicado en Etapa 1.

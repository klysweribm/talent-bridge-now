# Casos de uso — Autenticación

> Cubre `AUTH-1` (dev-login JWT, usuarios sembrados) y `AUTH-2` (OTP real).
> Ver `ROADMAP.md` para alcance técnico de cada uno.

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
de provisión que define AUTH-2 (ver "Abierto" en `ROADMAP.md` → AUTH-2:
colección Mongo administrada manualmente en el MVP).
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
(guard ya implementado en `AppRouter.tsx`).
**Reglas de borde / negativas:**
- Backend: cualquier endpoint protegido sin token válido → 401 (no 403 —
  403 es para rol incorrecto con sesión válida, ver `UC-*` de cada feature).
- F5 no debe cerrar la sesión (sesión persistida en `sessionStorage`,
  criterio de éxito de QW-1 — pendiente de recorrido manual en navegador).
- F5 con un JWT **vencido** (o malformado) → `/login` sin pintar nunca el
  contenido protegido, y la sesión persistida se limpia. Con la pantalla
  abierta, la sesión termina sola al llegar el `exp` del token.
- Al terminar la sesión (logout, 401 o vencimiento) o cambiar de usuario se
  vacía la caché de datos del frontend: el usuario B nunca ve datos de A.
- Un 401 tardío de una petición enviada con un token anterior no cierra la
  sesión nueva de un re-login.

# Roadmap — Features planeados

> Arriba, lo que FALTA; lo ya hecho va resumido al final. El detalle de lo cerrado vive en git,
> `good-practices/DEBT_TECH.md` y `docs/use-cases/`. El encuadre anterior (procesos → candidatos → entrevistas →
> feedback → reportes) espera el replanning Bench First.
>
> **Última actualización:** 2026-11-08 (OPP-AI-1 unidad 6 cerrada en `feature/OPP-AI-1`, sin commitear, en revisión: backend `POST /ai/opportunity-draft/file`; la unidad 5 sigue sin verificar en navegador; sigue la 7)

**Cómo se mantiene:** al cerrar algo, se baja a «✅ Cerrado» en una línea y se quita de «Qué falta». Lo pendiente nunca se entierra bajo lo hecho.

---

## Leyenda

📌 sin arrancar · 🚧 en progreso · ✅ completado · Complejidad: 🟢 1-2 días, 🟡 3-5 días, 🔴 6+ días o integración externa.
Prioridad (HIGH \| MEDIUM \| LOW): en una feature cerrada, lo que le **queda pendiente**.

---

## ▶ Qué falta

### Siguiente paso

**Unidad 7 de OPP-AI-1** (frontend: dropzone de brochure que generaliza el existente) en `feature/OPP-AI-1`. Debe: llamar a `POST /ai/opportunity-draft/file` (multipart, campo `file`); **traducir `OPPORTUNITY_SOURCE_UNREADABLE` en `opportunityDraft.translate.ts`** (hoy `SERVER_CODES` solo tiene 3 códigos, así que un 422 cae en `UNKNOWN`; el copy ya existe en `DRAFT_COPY.errors`, añadido sin test propio en la unidad 6); reutilizar el flujo de «solo rellena vacíos» del box mágico; tests escritos antes del código. La unidad 6 (backend) está cerrada pero **sin commitear y en revisión del usuario**, y la 5 **sin verificar en navegador** (ver «Pendiente de verificación humana»).

### Plan OPP-AI-1 (una sola numeración, 1..11)

«U0..U3» nombran solo **secciones de la HU** ([`opportunities-ai.md`](./docs/use-cases/opportunities-ai.md)); «unidad N» es el paso del plan.

| # | Unidad (criterio de éxito en una línea) | Sección HU | Estado |
| --- | --- | --- | --- |
| 1-3.5 | Glosario/ADR-016, textos «Oportunidad», banda, módulo skills, `band` y `startDate` | U0-U3 (insumos) | ✅ en `main` (PR #7) |
| 4 | Backend `POST /ai/opportunity-draft`: esquema validado, `normalizeSkills`, tope de texto y timeout por ConfigService (+ `.env.example` y compose en el mismo commit), `AI_UNAVAILABLE`/`AI_TIMEOUT`/`OPPORTUNITY_TEXT_TOO_LONG`; pm+recruiter, technical_ref 403, sin token 401 | U1 | ✅ (`401336a` y `4eb4858`; FlowLog sin cuerpos: DT-055, `576a69e`) |
| 5 | Frontend box mágico: rellena solo campos vacíos con «Sugerido por IA» y no crea nada | U1 | ✅ (`2d750e3`; sin verificar en navegador) |
| 5.5 | Refactor `src/shared/document-text` tras un puerto (hoy consumido por candidates; ai lo importará en la 6), sin cambio de comportamiento; causa de los 4 tests PDF explicada | U2 (prerrequisito) | ✅ (`aa1b8d5`) |
| 6 | Backend `POST /ai/opportunity-draft/file` (PDF/DOCX/MD/TXT en memoria; 422 `OPPORTUNITY_SOURCE_UNREADABLE`) | U2 | ✅ (sin commitear, en revisión; no verificada contra ICA real) |
| 7 | Frontend dropzone de brochure (generaliza el existente; traduce `OPPORTUNITY_SOURCE_UNREADABLE`) | U2 | 📌 SIGUIENTE |
| 8 | Backend `POST /bench/match`: 60 % skills, 25 % banda, 15 % disponibilidad, determinístico; ICA solo explica | U3 | 📌 |
| 9 | `GET /processes/:id/bench-suggestions` (llamada en memoria a bench) | U3 | 📌 |
| 10 | Frontend panel «Sugeridos de la banca» (etapa 2 y detalle) | U3 | 📌 |
| 11 | e2e 401/403/422/ICA caído y lento, corrida real con ICA, checklist de navegador, tabla Gherkin | — | 📌 |

### Pendiente de verificación humana

- **Recorrido en navegador con los 3 roles** (ana@, carlos@, mariana@ibm.com; checklist en `docs/use-cases/bench.md`): cierra DT-010, BENCH-1, QW-1, FE Etapa 2 y, con ellos, AUTH-1, QW-2 y las deudas DT-002, DT-007, DT-024. DT-010 incluye: F5 conserva la sesión, ningún link da 404, aviso de inactividad a los 360 s.
- «Fecha de inicio» en navegador (paso 1, edición, resumen y detalle); un `POST /processes` con `startDate` real por curl; arranque sobre una base sembrada antes del cambio (el seeder reescribe `band`, sin comprobar).
- Textos «Oportunidad» (unidad 2) y PROC-1 en navegador, y los `curl` de escritura de PROC-1 (solo cubiertos por e2e).
- **Box mágico (unidad 5) en navegador:** login mariana@ibm.com → Nueva oportunidad → pegar el texto ITAU → «Generar con IA» → campos con «Sugerido por IA» y nada creado → escribir un título a mano y regenerar → el título no se pisa → texto sin cliente → cliente «por completar» → apagar el backend o ICA → mensaje claro y formulario manual usable. **Requisito:** el backend debe ser uno con el código nuevo (el contenedor del `:3000` es una imagen vieja SIN el endpoint) y con las env `OPPORTUNITY_DRAFT_*`. Nadie ha visto renderizados el layout, el borde, el badge ni el aviso; tampoco se probó contra el endpoint real ni ICA desde la UI (todo con la infra mockeada); sin prueba con lector de pantalla ni de editar el texto entre un fallo y el reintento.
- Mensaje «Block Secrets» de Vault Radar en los commits: no bloqueante, significado desconocido.

### Riesgos abiertos y decisiones por tomar

- **Tests PDF (explicado en la 5.5):** los 4 fallos (2 de `classic-cv-extractor`, 2 del spec del extractor local) ocurren con `npx jest` a secas porque `pdf-parse`/pdf.js necesita `--experimental-vm-modules` («Setting up fake worker failed: A dynamic import callback was invoked without --experimental-vm-modules»). Hay que usar `npm test` (lleva el flag), no `npx jest`; el CI usa `npm run test:cov`, que también lo lleva (`.github/workflows/backend-ci.yml`, `package.json`). Reproducido con Node 24.2 y 22.23; no era defecto del código ni intermitencia. El extractor solo registra `error.name`, por eso el mensaje real no aparecía (correcto por privacidad). Regla añadida en `.claude/rules/testing.md`.
- **Diferencia 306 vs 304 de `validate-quality`: explicada (inferencia a partir de los patrones de `LIMITS`; no comprobada archivo por archivo).** `LIMITS` solo cuenta archivos bajo `capabilities/`: la 5.5 sacó de ahí el `.port.ts` y el `.adapter.ts` (306 → 304) y la unidad 6 añadió un `.controller.ts` y un `.service.ts` (304 → 306).
- **Residual de privacidad (DT-056), sigue abierta:** DT-055 está resuelta (`576a69e`), pero no se verificó: los casos e2e se escribieron después del código y el camino del middleware solo lo cubre su unit. La revisión pensada para antes de la unidad 6 NO se hizo: `POST /ai/opportunity-draft/file` nació con `@NoBodyLog()` y test de metadata, pero la auditoría de las líneas `@TraceFlow`, los headers y los controllers de bench, users y auth-session sigue sin hacerse.
- **Aviso de regla (sin editar):** `.claude/rules/cv-pii-handling.md` línea 26 dice «Lista cerrada: PDF y DOCX» y el brochure admite además MD y TXT. Decide el usuario si se acota la regla al CV.
- **Sin verificar en la unidad 4:** `AI_TIMEOUT` y `AI_UNAVAILABLE` contra ICA real (solo puerto falso en unit/e2e); los tests de config y el e2e se escribieron junto con el código, sin verlos fallar antes; el contenedor de `:3000` es una imagen antigua, no se reconstruyó ni se probó el compose.
- **Defaults sin confirmar:** texto máximo 8000 caracteres, timeout del borrador ICA 30 s y tope del brochure `OPPORTUNITY_SOURCE_MAX_FILE_BYTES` 5 MiB (este último ya con default en código, `OPPORTUNITY_SOURCE_DEFAULT_MAX_FILE_BYTES`), todos propuestos, no confirmados por negocio.
- **Pregunta abierta:** ¿las dos envs del borrador de texto (`OPPORTUNITY_DRAFT_MAX_TEXT_CHARS`, `OPPORTUNITY_DRAFT_TIMEOUT_MS`) deben tener también default en código (8000 / 30000)? Hoy fallan cerrado (decisión de la unidad 4); el usuario decidirá.
- **Riesgos de la unidad 6:** (a) firmas PDF/DOCX/OLE duplicadas a propósito respecto de `candidates` (~10 líneas) para no cruzar capabilities (decisión del usuario: no se registra como deuda); (b) **nada verificado contra ICA real con un brochure**, ni DOCX real por HTTP (el e2e solo manda PDF y MD), ni multer con un archivo cercano a 5 MiB; (c) hasta la unidad 7 el frontend no reconoce el código 422 (cae en `UNKNOWN`); (d) efecto lateral aceptado y verificado del ajuste en `LocalDocumentTextExtractor` (`getText({ first, pageJoiner: '' })`): el texto de CV de `candidates` ya no lleva el `-- 1 of 1 --` final, sin cambios en los asserts de candidates.
- **DT-053:** ¿`seniority` se queda en el recurso de banca y en el filtro de `GET /bench`? Hoy no cambia; el match usa `band`.
- **Decidido en la 5.5:** no lleva ADR (movimiento de código bajo `shared/` que sigue el puerto + adapter de `backend-architecture.md`). ADR-016 sigue «Propuesto». El 400 «The file could not be read: it may be corrupt» es el contrato actual del puerto; en la unidad 6 se resolvió con un error de dominio propio para el brochure (`OPPORTUNITY_SOURCE_UNREADABLE`, 422); el 400 de `candidates` no cambia.
- Términos [POR VALIDAR CON LUC/GUS] de la U0 sin confirmar por negocio.
- Deuda de OPP-AI-1: DT-050, DT-056, DT-059 (2 warnings de longitud en specs de la unidad 6), DT-052 (el `PATCH` no puede vaciar `startDate`), DT-053, DT-054 (`isRealDate`: backend resuelto en `shared/validation`; siguen las 2 copias del frontend), DT-057 (`useProcessDataForm.ts` 61/60), DT-058 (`as never` en `useOpportunityDraft`). DT-031 (FlowLog + candidatos) sigue abierta, sin decisión del usuario.
- **Tests de la unidad 5 más débiles:** `ProcessDataStep.draft.test.tsx` (9 tests) salió en rojo solo por falta de UI, no por aserciones concretas; `AiSuggestedBadge`, `DraftFieldFrame`, `OpportunityDraftBox`, `DraftNotices`, `DraftErrorAlert` y `draftMarks` se escribieron después del código; `OpportunityDraftPanel`, `useGenerateOpportunityDraft` y `useOpportunityDraft` no tienen test propio (los cubre el del organismo). Un test de infra («should translate HTTP errors») falló varias veces por una rareza del runner con `mockRejectedValue` + `rejects.toBeInstanceOf`; quedó con otra forma y pasa, sin causa explicada.
- **Seguridad del repositorio:** la URL de `origin` lleva un token de GitHub en texto plano en `.git/config`; revocarlo, usar credential helper o SSH y reescribir la URL. Además `~/.gitconfig` tiene `http.sslverify=false`.
- **21 commits con `Co-Authored-By`** ya en `origin`: quitarlos exige `--force`, descartado hasta nueva orden (nunca `--force`). Los de CAND-2 no la llevan; los nuevos van sin atribución.
- **Modo `ica` (archivo):** recomendado retirarlo tras la demo (DT-033; contacto vacío y CV huérfanos en ICA si la subida expira).
- **Imagen de producción (DT-034):** `pdf-parse` arrastra `@napi-rs/canvas`, sin probar en Alpine; verificar antes de DEPLOY-1.
- **Replanning Bench First** (ADR, `docs/domain.md`, casos de uso, `shared-types`) y `MATCH-1`; actualizar `/roadmap-task` (DT-025). Opcionales: OBS-2, DT-020, DT-027 a DT-038.

### Gates y git (cierre de la unidad 6; antes, unidad 5.5, unidad 5, unidad 4 y DT-055)

**Cierre de la unidad 6 (sin commitear, en revisión del usuario; sin hash):** Gates re-ejecutados por el orquestador tras los dos ajustes posteriores (extractor con `pageJoiner: ''`; default en código del tope del brochure). Backend: typecheck 0, lint 0 errores / 27 warnings (base 25; los 2 nuevos son `max-lines-per-function` en `opportunity-draft-file.service.spec.ts` y `test/ai-opportunity-draft-file.e2e-spec.ts`, DT-059), `npm test` 88 suites 838/838 (base 84/793; antes de los ajustes 839: −2 casos de «PDF sin texto con marcador» del servicio, que ya no aplican, y +1 caso de config), e2e contra Mongo real 34 suites 269/269 (base 33/257, +12; ahora también comprueba que con env inválida un archivo real sigue la ruta normal, 200). El 422 por PDF sin texto lo cubren el spec del adapter y el e2e. Frontend: typecheck 0, lint 0 warnings, 192 archivos 945/945, build ok (único cambio: una línea de copy). `validate-quality --strict` 306 archivos, 0 críticos, 0 moderados. Greps: `ai` no importa `candidates` en código no-test. **Verificado:** 401/403 sin llamar a ICA; 200 con PDF y MD/TXT por HTTP (e2e) y con DOCX en el test del servicio con extractor falso; 422 en PDF sin texto y PDF corrupto (sin llamar a ICA); 400 en xlsx, archivo ausente, sobre el tope y texto largo; validación por firma; `AI_UNAVAILABLE`/`AI_TIMEOUT` con puerto falso y falla cerrada sin la env; `@NoBodyLog()` con test de metadata; sin PII en logs (espía de Logger: ni nombre ni contenido). **No verificado:** corrida real contra ICA con un brochure; DOCX real por HTTP; multer con archivo cercano a 5 MiB; UI; 5 MiB y 8000 chars/30 s con negocio; recorrido en navegador del box mágico (unidad 5). Los tests de la línea de copy del frontend no existen (sin test propio). Deuda: DT-059 (2 warnings de longitud en specs). `ai.controller.ts` mide 61 líneas pero `validate-quality` no lo marca (0 moderados) y no se registra. Commit `8b826b5`: CLAUDE.md pide `npm test --` para tests individuales del backend.

**Cierre de la unidad 5.5 (`aa1b8d5`):** Backend: typecheck 0, lint 0 errores / 25 warnings (línea base), `npm test` 84 suites 793/793, e2e contra Mongo real 33 suites 257/257; `validate-quality --strict` 304 archivos, 0 críticos, 0 moderados. Greps: 0 resultados de `cv-text-extractor|CV_TEXT_EXTRACTOR_PORT|LocalCvTextExtractor|ICvTextExtractorPort` en `src` y `test`; `ai` no importa `candidates`; `shared/document-text` no importa `capabilities/`. No verificado: uso desde `ai` (unidad 6), recorrido en navegador de la unidad 5, la diferencia 306→304 en `validate-quality`. Frontend no tocado.

**Cierre de la unidad 5 (sin commitear):** Frontend: typecheck 0, lint 0 errores y 0 warnings (`--max-warnings 0`), tests 192 archivos / 945 tests (partida 182 / 909), build ok; `validate-quality --strict` 306 archivos, 0 críticos, 0 moderados. Backend: no tocado ni re-ejecutado (último estado conocido: jest 793, e2e 257, lint 25 warnings). Tokens de Tailwind usados comprobados uno a uno en `tailwind.colors.ts` / `tailwind.config.ts`. TDD en rojo por la razón correcta en `applyOpportunityDraft`, `opportunityDraft.translate` y `opportunityDraft.infra`.

**Tras DT-055 (sin commitear, `576a69e`):** backend typecheck 0, lint 0 errores / 25 warnings (+2 `max-lines-per-function`: `flow-log.interceptor.spec.ts` y `test/flow-log-no-body.e2e-spec.ts`), jest 84 suites 793/793, e2e contra Mongo real 33 suites 257/257; `validate-quality --strict` 294 archivos, 0 críticos, 0 moderados. Frontend no tocado ni re-ejecutado. Corrida real en el puerto 3101 (`FLOW_LOG_ENABLED=true`): 0 apariciones de las marcas ni de ITAU/NestJS en el log; el login sigue mostrando su body con el token redactado.
**Cierre de la unidad 4:** Backend: typecheck 0, lint 0 errores / 23 warnings (3 nuevos `max-lines-per-function` en specs largos), jest 82 suites 778/778, e2e contra Mongo real 32 suites 253/253 (12 nuevos). Frontend: typecheck 0 (tests sin re-ejecutar; 909/909 en la 3.5). `validate-quality --strict`: 294 archivos, 0 críticos, 0 moderados. Corrida real contra ICA (claude-haiku-5-5, puerto 3100): texto ITAU → 200 en ~5,5 s con título, cliente ITAU, rol Fullstack, skills [React, NestJS], banda 8, inicio 2026-12-01, sin vacíos; texto «backend senior con Java y Spring» → cliente vacío, banda null, aviso y `missingFields`; intento de inyección en el texto → no obedecido; carlos@ 403, sin token 401, 8001 caracteres → 400 `OPPORTUNITY_TEXT_TOO_LONG`, texto en blanco → 400; logs solo `chars`, `latencyMs`, `outcome`. Git: rama `feature/OPP-AI-1`, commit A `401336a` hecho, commit B `4eb4858`, sin push; `origin` = `klysweribm/talent-bridge-now`; commits sin atribución.

### Backlog por prioridad

| ID | Prio | Depende de | Qué es |
| --- | --- | --- | --- |
| DRAFT-1 | MEDIUM | QW-2, PROC-1, CAND-2 | Recuperar formularios no enviados tras cierre de sesión (detalle abajo) |
| CAND-4 | LOW | CAND-2 | Retirar el modo `ica` con archivo (DT-033) y mejorar el clásico (país, rol, experiencia) |
| FE-OTP-1 | LOW | Etapa 1 | Login OTP por correo `@ibm.com` + panel de marca (spec en `docs/use-cases/auth.md`) |
| AUTH-2 | LOW | FE-OTP-1 | Backend real de OTP con JWT |
| AUTH-3 | LOW | QW-2, AUTH-2 | Refresh y expiración por inactividad en backend (cierra DT-018) |
| AUTH-4 | LOW | AUTH-3 | Tokens en cookies httpOnly (cierra DT-019) |
| HARDEN-1 | LOW | features de UI | Endurecimiento transversal (= FE Etapa 8) |
| DEPLOY-1 | LOW | HARDEN-1 | Deploy en IBM Cloud `br-sao` |
| Replanning Bench First / MATCH-1 | — | — | ADR, dominio, casos de uso; FE Etapas 3-7 esperan este replanning |
| POC 2e, 2f | — | — | Detalle de proceso con acciones (editar, agregar/quitar candidatos, reclutador, estado, cancelar) y regla de no más barrels. Estado a 2026-11-02: «en curso por otro agente»; avance sin confirmar |
| POC 2c | — | — | Dashboards propios por rol (el del referente no muestra procesos: la API le responde 403); hoy solo el contador y la lista de procesos son reales |
| POC 2b | — | — | Visibilidad `public/protected` de candidatos y filtro por dueño (R1-R3) |
| POC 4 y 5 | — | — | Asignar referente técnico a un proceso y lista de referentes con disponibilidad (juntas; requieren sembrar referentes) |
| POC 6a, 6b | — | — | Booking, vista PM/reclutador y vista referente |
| POC 8 | — | — | Feedback asistido por IA |
| POC 7, 9 | — | — | Estrellas y rating de referentes; pool externo de casi-contratados (bajo esfuerzo) |

Orden sugerido de la POC: 2e/2f → 4 y 5 → 6a y 6b mínimas → 8 → 2c → 7 y 9; la 2b al final salvo que la demo exija privacidad entre reclutadores. Equivalencias Bench First: PROC-2 = Oportunidades + box mágico; CAND-1 = BENCH + Talent Pool + carga de perfil; INT-1 = disponibilidad + booking top 5 + entrevistas por etapa; FEED-1 = feedback en 3 etapas con IA; REP-1 = dashboard ejecutivo (PDF LOW); CV-1 = acción «analizar perfil» vía ICA. Esos IDs ya no existen como secciones. Caja 3 de `/processes/new` (spec pendiente): unidad de negocio, cliente, descripción, rol, expertise, contacto en el cliente, código de proyecto, PM del proyecto (los tres últimos opcionales) y plazos de contratación.

---

## 🚧 OPP-AI-1 — Oportunidad asistida por IA y sugerencias de la banca (HIGH)

**Estado:** unidades 1-3.5 ✅ en `main` (PR #7; detalle en git y en `opportunities-ai.md`); unidad 4 ✅ backend (rama `feature/OPP-AI-1`, commit `4eb4858`); unidad 5 ✅ frontend (`2d750e3`, sin verificar en navegador); 5.5 ✅ refactor `shared/document-text` (`aa1b8d5`); 6 ✅ backend del brochure (sin commitear, en revisión); 7 SIGUIENTE; 8-11 📌 · **Casos de uso:** [`docs/use-cases/opportunities-ai.md`](./docs/use-cases/opportunities-ai.md) (R1-R7) · **Lenguaje:** [`docs/glossary.md`](./docs/glossary.md) · **Decisión:** ADR-016 (Propuesto) · **Depende de:** AI-1, BENCH-1, CAND-2 · **Commits:** `22cfeee`, `5678f4e`, `68c60dd`, `e1140a6`, `c5e8ac0`, `6d732cb`, `401336a`, `4eb4858`, `576a69e` (DT-055), unidad 5: `2d750e3`, unidad 5.5: `aa1b8d5`.

El PM o reclutador describe el perfil en un box mágico o sube un brochure; la IA (ICA) rellena el formulario sin crear nada, y en la etapa 2 se sugieren recursos de la banca con un % de match calculado por el backend.

**Decisiones vigentes:** la banda es un entero 6 a 10 (sin jr/ssr/sr/lead) y el match compara banda con banda (misma 100, diferencia de 1 → 50, resto 0); pesos y umbral (`MATCH_WEIGHT_*`, `MATCH_THRESHOLD=75`, `MATCH_EXPLAIN_TIMEOUT_MS=10s`) por ConfigService; ICA solo explica y nunca recibe nombre, código ni contacto; `startDate` opcional `YYYY-MM-DD` (ausente → «Disponibilidad: no evaluada» y pesos redistribuidos); «Expectativas de evaluación técnica» = `roleDescription`, que el borrador rellena; skills desconocidas se conservan como se escribieron (catálogo en `apps/backend/src/shared/skills/`, import directo, sin barrel); el texto se extrae vía `shared/document-text` (existe desde la 5.5; `ai` lo importa desde la 6 vía `DocumentTextModule`), sin consumir `candidates`; logs solo con longitud, latencia y resultado; fixture de verificación ITAU: Fullstack, React + NestJS, banda 8, inicio 2026-12-01.

**Criterios pendientes**

- **Unidad 4 (HU U1, backend) ✅:**
  - [x] Texto libre → borrador con vacíos y aviso (R1, R2); corrida real con ICA (ITAU) verificada.
  - [x] ICA falla → `AI_UNAVAILABLE` 503 / `AI_TIMEOUT` 504; texto largo → `OPPORTUNITY_TEXT_TOO_LONG` 400. Verificado solo con puerto falso; no contra ICA real lento o caído.
  - [x] Referente técnico 403 y sin token 401 en `POST /ai/opportunity-draft`.
- **Unidad 5 (HU U1, frontend) ✅ en código y tests; falta verificación humana en navegador:**
  - [x] Los campos rellenados (solo los vacíos; no pisa lo escrito) muestran «Sugerido por IA», que se quita al editar; no se crea nada hasta «Crear oportunidad» (R1; test: no se llama a `createProcess`). Pendiente de verificación humana.
  - [x] Campos vacíos y `missingFields` «por completar» con aviso (R2). Pendiente de verificación humana.
  - [x] Si ICA falla: mensaje claro y formulario manual (R6), ramificando por `code` (`AI_UNAVAILABLE`, `AI_TIMEOUT`, `OPPORTUNITY_TEXT_TOO_LONG` con el `message` del servidor; sin code → `UNKNOWN`; red caída → `NETWORK`). Solo con la infra mockeada.
  - [ ] Escenario «Skills normalizadas» de extremo a extremo («Reactjs»/«Nestjs» → «React»/«NestJS»; depende también de la unidad 8).
- **Unidad 5.5 ✅:**
  - [x] Puerto `DOCUMENT_TEXT_EXTRACTOR_PORT` en `shared/document-text`, consumido por `candidates` vía `DocumentTextModule`; tests de CAND-2 en verde sin cambio de comportamiento (mismo 400, mismas constantes).
  - [x] `ai` lo consume: `AiModule` importa `DocumentTextModule` y `OpportunityDraftFileService` usa el puerto (unidad 6, sin commitear).
  - Menor: `DOCUMENT_PDF_MIME` duplica `CV_PDF_MIME` (queda en `cv.constants.ts`); no se registra como deuda por no cumplir el criterio de DEBT_TECH.
- **Unidad 6 (HU U2, backend) ✅ sin commitear, en revisión:**
  - [x] Backend (R3): el brochure rellena igual que el box (delega en `OpportunityDraftService.draft`), se procesa en memoria, y los logs solo llevan `bytes`, `latencyMs`, `outcome` (test con espía de Logger); `@NoBodyLog()` con test de metadata. Verificado con PDF y MD por HTTP y DOCX con extractor falso; **no contra ICA real**.
  - [x] Backend: PDF sin texto, corrupto o en blanco → 422 `OPPORTUNITY_SOURCE_UNREADABLE` «No pudimos leer el documento», sin llamar a ICA.
  - [x] recruiter+pm; technical_ref 403; sin token 401.
- **Unidad 7 (HU U2, frontend):** [ ] el dropzone sube el brochure y rellena solo campos vacíos (parte UI de R3: sin guardar el archivo ni su contenido en el cliente); [ ] `opportunityDraft.translate.ts` reconoce `OPPORTUNITY_SOURCE_UNREADABLE` → «No pudimos leer el documento» y el formulario queda intacto (parte UI del 422); [ ] test propio del copy y de la traducción.
- **Unidades 8-9 (HU U3, backend):** [ ] % determinístico independiente de ICA (R4); [ ] sin `startDate` → disponibilidad no evaluada (R5); [ ] solo recursos `available` o `soft_booked`, sin acción de asignar (R7); [ ] ICA solo recibe skills, nivel, banda y disponibilidad; [ ] technical_ref 403 y sin token 401 en `POST /bench/match`.
- **Unidad 10 (panel):** [ ] «Sugeridos de la banca» ordenados por %, con «Recomendado» desde 75 %, skills que cumple y que le faltan; [ ] ICA caído → % y desglose sin la frase de la IA; [ ] sin coincidencias → «Sin coincidencias suficientes en la banca» y «Buscar candidatos externos»; [ ] cambiar el perfil recalcula; [ ] el mismo panel en el detalle de la oportunidad.
- **Unidad 11:** [ ] e2e, corrida real con ICA y checklist de navegador (ver «Qué falta»).

---

## 📌 Backlog: detalle de lo esencial

> Sin arrancar. Cada feature espera a la anterior. FE (Etapas 3-7, esperan el replanning) y HARDEN-1 (= Etapa 8) abajo.

## DRAFT-1 — Recuperar trabajo no enviado tras el cierre de sesión (MEDIUM)

**Estado:** 📌 sin arrancar (solo registrada; no implementar sin plan aprobado) · **Prioridad:** MEDIUM · **Complejidad:** 🟡 Media · **Casos de uso:** [`docs/use-cases/drafts.md`](./docs/use-cases/drafts.md)

Motivo: la sesión se cierra por inactividad (aviso a los 360 s) o expiración del JWT y la caché de React Query se vacía (DT-015); un formulario largo se pierde.

- **Alcance:** capability `drafts` (colección `drafts { userId, formKey, entityId?, payload, schemaVersion, updatedAt }`, índice único `{ userId, formKey, entityId }`, TTL `DRAFT_RETENTION_DAYS` defecto 7 por ConfigService; `PUT/GET/DELETE /drafts/:formKey` y `GET /drafts`, siempre por el `userId` del JWT). Frontend: hook `useFormDraft(formKey)`, autoguardado con debounce (`DRAFT_AUTOSAVE_MS` 3000), guardado forzado antes del cierre, banner «Recuperar / Descartar». Formularios iniciales: nuevo proceso, editar proceso, agregar candidato.
- **Decisiones:** el borrador no crea ni modifica entidades; nunca se guarda el archivo del CV; el `payload` se valida contra `schemaVersion` (versión vieja → se descarta con aviso); logout manual pregunta «¿Conservar borrador?», inactividad/expiración conservan siempre; sin PII en logs (solo `userId`, `formKey`, tamaño).
- **Preguntas abiertas (con defecto):** uno por formulario nuevo y uno por entidad en edición; si la entidad cambió en el servidor, avisar y dejar elegir; widget «Borradores pendientes» en Inicio (LOW).
- **Criterios:** [ ] se ofrece recuperar tras cierre por inactividad/expiración; [ ] descartar o confirmar elimina el borrador; [ ] no crea entidades; [ ] aislamiento entre usuarios (e2e con dos usuarios, 401 sin token); [ ] `schemaVersion` vieja descartada con aviso; [ ] vence por TTL; [ ] el archivo del CV nunca viaja.

---

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

Depende de FE-OTP-1. Casos de uso: [`docs/use-cases/auth.md`](./docs/use-cases/auth.md). Complejidad Alta (rate limiting, lockout, hash, provisión de roles).

- **Alcance:** `POST /auth/otp/request`, `/otp/verify`, `/refresh`, `/logout`; código de 6 dígitos aleatorio, hasheado en MongoDB con índice TTL ~10 min (ADR-008, sin Redis), invalidando el anterior; throttler en memoria (`@nestjs/throttler`) y lockout tras M fallos (contador en el documento del OTP); envío por `EmailSenderPort` + SMTP (ADR-010) con plantilla en `packages/email-templates`; mecanismo para pre-registrar correo con rol (colección Mongo manual en el MVP, o admin: por decidir); `auth.infra.ts` pasa de mock a `fetch`.
- **Criterios:** [ ] request genera, hashea y envía; [ ] verify rechaza incorrecto/expirado/reusado con 401 y aplica lockout; [ ] rate limiting rechaza antes de enviar email; [ ] hay forma de asignar rol antes del primer login; [ ] `@Roles('recruiter','pm')` rechaza `technical_ref` con 403; [ ] las guardas del frontend no cambian de contrato; [ ] el OTP nunca aparece en logs ni responses.

---

## AUTH-3 — Sesión corta con refresh y expiración por inactividad en backend (LOW)

**Estado:** 📌 sin arrancar · **Prioridad:** LOW · **Complejidad:** 🟡 Media · **Registrado:** 2026-10-27

Hoy el JWT dura 1 h y el logout no lo invalida (**DT-018**). Depende de QW-2 y AUTH-2 (cambia la emisión de tokens).

- **Diseño:** access JWT corto + refresh token opaco con hash en Mongo (`sessions`, TTL), rotado en cada uso con detección de reutilización; refresh bajo demanda (401 o cerca del vencimiento, solo si hubo actividad), sin polling; TTL del access y TTL deslizante por env (se añaden a `.env.example` entonces), validando al arrancar TTL de sesión ≥ idle timeout + aviso (QW-2) + margen; el logout revoca la sesión.
- **Pregunta abierta:** se mencionó un TTL de 3 min y luego una renovación de 4 min; fijar un valor al planificar.
- **Criterios:** [ ] sin actividad no hay refresh y la sesión se va por TTL; [ ] tras logout el access deja de aceptarse y el refresh queda revocado; [ ] reutilizar un refresh rotado revoca la sesión; [ ] DT-018 cerrada.

---

## AUTH-4 — Tokens de sesión en cookies httpOnly (LOW)

**Estado:** 📌 sin arrancar · **Prioridad:** LOW · **Complejidad:** 🟡 Media · **Registrado:** 2026-10-27

El token vive en `sessionStorage`, legible por un XSS (**DT-019**). Depende de AUTH-3.

- **Diseño:** access y refresh en cookies `httpOnly`, `Secure` (forzado en producción; configurable en local porque Safari no lo acepta en `http://localhost`), `SameSite=Lax/Strict`; refresh con `Path=/api/v1/auth`. CSRF: `SameSite` más cabecera personalizada obligatoria en endpoints que cambian estado. Piezas: `cookie-parser` (**nueva dependencia: preguntar antes**), `credentials: 'include'` en `httpClient`, CORS con credenciales; el frontend deja de guardar el token; Swagger conserva `Authorization: Bearer`. No es bala de plata contra XSS.
- **Criterios:** [ ] el token no es legible desde `document.cookie` ni `sessionStorage`; [ ] login/refresh/logout solo con cookies, en local y tras el proxy; [ ] petición cross-site sin la cabecera es rechazada; [ ] DT-019 cerrada.

---

## HARDEN-1 — Endurecimiento transversal final (LOW)

**Estado:** 📌 sin arrancar · **Prioridad:** LOW · **Complejidad:** 🟢 Baja (por ítem, varios ítems)

Equivale a la Etapa 8 de FE; se cierra antes de DEPLOY-1 y espera a que existan todas las features de UI (la decisión sobre `@carbon/react` —instalado, 0 imports: mantener o quitar— no se puede tomar a medias).

- **Alcance:** `validate-quality.mjs --strict` bloqueante en `.github/workflows/frontend-ci.yml`; decisión sobre `@carbon/react`; `config/env.ts` tipado sobre `import.meta.env`; error boundary global en `AppLayout`; tests faltantes (`useLoginForm`, `ui.store.ts`, hooks nuevos).
- **Criterios:** [ ] CI falla ante un crítico nuevo; [ ] `@carbon/react` eliminado o con primer uso documentado; [ ] ningún componente tumba la app sin pasar por el error boundary.

---

## DEPLOY-1 — Deploy real en IBM Cloud (LOW)

**Estado:** 📌 sin arrancar · **Prioridad:** LOW · **Complejidad:** 🔴 Alta

Hoy el MVP corre solo en Podman local. Arquitectura objetivo en ADR-006 a ADR-012 (`docs/architecture/README.md`): todo en Code Engine `br-sao`, un solo ambiente. Depende de HARDEN-1.

- **Alcance:** Databases for MongoDB, COS, proyecto Code Engine con `tb-web` (Dockerfile de producción multi-stage, nginx no-root, SPA + proxy `/api`, sin CORS) y `tb-api` (`project-only`, health `GET /api/v1/health`), ICR; secrets de Code Engine (Secrets Manager queda para Fase 2); job de deploy en `backend-ci.yml`/`frontend-ci.yml` solo en `main` (build → ICR → `ibmcloud ce app update`, API key como secret de GitHub); IBM Cloud Logs; backup nativo de Mongo; retención de CVs en COS por definir (no bloqueante). Por validar antes de cerrar (ver «Abierto» en la arquitectura): disponibilidad de watsonx.ai en `br-sao` y alcance de ICA desde Code Engine, owner/billing, relay SMTP, internet vs. VPN + dominio. También: DT-021 (`Dockerfile` fija `NODE_ENV=production`) y DT-034.
- **Criterios:** [ ] app accesible por URL sin `localhost`; [ ] flujos de la POC contra servicios reales; [ ] credenciales nunca en logs, responses ni repo; [ ] `tb-web` llega a `tb-api` sin CORS; [ ] el pipeline despliega en cada push a `main`; [ ] `/health` con `database: "up"` contra Mongo real.

---

## ✅ Cerrado en código

> Una línea por feature. Lo único que les queda abierto está en «Qué falta». Detalle en git, `DEBT_TECH.md` y los casos de uso.

| ID | Qué entregó | Pendiente | Referencia |
| --- | --- | --- | --- |
| CAND-2 | Carga de CV (PDF/DOCX) con 3 extractores (`ica-text` principal, `classic` completado con ICA, `ica` solo para comparar), alta y `PUT /candidates/:id` con auditoría y avisos de duplicados; `pdf-parse` + `mammoth`; la extracción no persiste. Probado en vivo por el usuario (2026-11-02), mergeado en PR #5 | Imagen de producción con PDF (DT-034); modo `ica` por retirar (DT-033, CAND-4); verificar en Mongo los datos adicionales; límites DT-031 a DT-038, sin claves de búsqueda en candidatos anteriores (DT-032), RUT opcional futuro (compliance), decidir «PM» vs «Project Manager» en el aviso de actualización | [candidates.md](./docs/use-cases/candidates.md), ADR-015 |
| AI-1 | Capability `ai`: coordinator que nunca lanza, ICA como proveedor (reemplaza watsonx.ai), `fake` solo por `AI_PROVIDER=fake`, salida estructurada, modelo por defecto `claude-haiku-5-5`, fallos como 503 y nunca 401; `GET /ai/status`, `POST /ai/ask`. Verificado en vivo con ICA real | `MODEL_NOT_FOUND` solo cubierto por tests; timeouts/tokens nuevos (60 s por llamada, 90 s total, 8192 tokens) sin verificar en el backend en ejecución; límites: sub-agentes y tool-calling (`TODO(AI-2)`), `stream`, persistencia de conversaciones, PII a ICA aceptada (DT-030), alcance de ICA desde `br-sao` (DEPLOY-1) | [ai.md](./docs/use-cases/ai.md), ADR-014 |
| PROC-1 | Crear procesos, asociar de 1 a N candidatos (`MAX_CANDIDATES_PER_PROCESS`), lista y detalle, `GET /processes/limits`, `GET /candidates`, «Candidatos» en el menú, Inicio con procesos reales; PM y reclutador únicos. Formulario de 3 pasos (mockups en `docs/design/mockups/proceso-nuevo/`) | Recorrido en navegador y `curl` de escritura; fuera del MVP: referentes, seniority/skills del rol, buscador de candidatos, notificaciones, etapas y semáforo; deuda DT-039 a DT-042 | [processes.md](./docs/use-cases/processes.md), ADR-013 |
| BENCH-1 | Banca desde `bench.mock.json` (30 recursos, seed idempotente fail-closed): `GET /bench`, `/bench/skills`, `/bench/:benchCode` para `recruiter` y `pm` (`TODO(RBAC-1)`), pantalla `/bench`. Verificado en vivo (stack, `curl` por rol, imagen de producción). Commits `797e4fb`, `f8fbfd5`, `05dc818`, `febf8af` | Recorrido en navegador con los 3 roles (checklist en el caso de uso); límites DT-027 a DT-029 | [bench.md](./docs/use-cases/bench.md) |
| AUTH-1 | `POST /auth/dev-login` fail-closed (`AUTH_DEV_LOGIN_ENABLED=true` exacto, nunca en producción; DT-008), `JwtAuthGuard`/`RolesGuard`/`@Roles` en `shared/auth/`, `httpClient` limpia sesión ante 401 (DT-009). Verificado en vivo | DT-010 (navegador) | [auth.md](./docs/use-cases/auth.md) |
| QW-2 | Variables sin consumidor retiradas (`a1c5b96`), `POST /auth/logout` y `auth_events` con TTL 90 días (`1341f8a`), `useLogoutMutation` (`666fcf0`), idle timer 360 s + cuenta atrás 60 s (`71cb074`). Verificado con curl + Mongo | DT-010 (aviso a los 360 s); DT-022, DT-023, DT-024; DT-018 y DT-019 las cierran AUTH-3 y AUTH-4; límites: `AUTH_EVENT_RETENTION_DAYS` inválido cae a 90 sin aviso, logout `expired` solo si el JWT sigue válido, `httpClient` sin timeout | [auth.md](./docs/use-cases/auth.md) |
| QW-1 | Gates, demo robusta (navegación única, `ErrorBoundary`, sesión persistida, usuarios demo) y fundaciones (`shared-types`, `env.ts`, `httpClient`, helmet/throttler/health); `/health` con `database: "up"` verificado | Recorrido en navegador (DT-010); `npm run lint` del frontend sale en rojo por `--max-warnings 0` (2 warnings en `sessionCacheGuard.test.tsx`) | `git log`, `DEBT_TECH.md` |
| FE Etapas 0-2 | Etapa 0 calidad, Etapa 1 `LoginPage` (DT-001), Etapa 2 shell/`SidebarNav` (`dd77ff8`), Inicio del reclutador (`2ef1a5b`), guardas de ruta (`0326925`) | Revisión en navegador (DT-010) cierra DT-002, DT-007, DT-024; Etapas 3-7 esperan el replanning; Etapa 8 = HARDEN-1. UX: `docs/design/UX-GUIDELINES.md` (manda sobre cualquier mockup; todo `useQuery` bajo rutas protegidas, DT-015) | `DEBT_TECH.md` |
| OBS-1 | FlowLog en `apps/backend/src/shared/observability/`, apagado por defecto (`FLOW_LOG_ENABLED=false`), fail-closed, nunca en producción | OBS-2 (flag `FLOW_LOG_MONGO` / `mongod --quiet`, por decidir), DT-020, DT-021 | `.claude/rules/backend-architecture.md` → Logging |

---

## Cambios a este roadmap

Todo reordenamiento queda registrado aquí (fecha + razón). Una idea nueva sin plan se agrega como feature 📌.

### Historial

| Fecha | Cambio | Razón |
| --- | --- | --- |
| 2026-09-13 a 2026-10-18 | Roadmap inicial; Etapa 1 de FE (DT-001); `FE-OTP-1` y `AUTH-2` pasa a OTP; reorden hacia el vertical demo (`QW-1`, Etapas 2-3, `AUTH-1`); arquitectura objetivo IBM Cloud (ADR-006 a ADR-012); modelo de dominio (ADR-013); creado `docs/use-cases/`; `AUTH-1` backend verificado (bug de `@Prop` en uniones). | Backlog vivo por feature, demo al sponsor y decisiones de arquitectura que no tenían ADR. |
| 2026-10-24 a 2026-10-30 | `AUTH-1` cerrado (DT-008/009); hardening de sesión del frontend (DT-015/016/017); limpieza de `legacy_docs/` (alcance A); `QW-2` y `OBS-1` cerrados; altas DT-018 a DT-024; Etapa 2 de FE cerrada en código; fuentes de verdad consolidadas (`.clinerules` y `PROJECT_CONTEXT.md` como punteros); `BENCH-1` implementado y verificado en vivo (DT-027 a DT-029); ROADMAP adelgazado y reordenado. | Preparar el replanning Bench First y mostrar primero lo que toca hacer. |
| 2026-10-31 | `AI-1` iniciada: capability `ai` con ICA (ADR-014), contrato en `shared-types`, alta DT-030. | La POC necesita IA en CV, match y feedback. |
| 2026-11-01 a 2026-11-02 | `CAND-2` implementada y cerrada (3 extractores, alta y actualización con auditoría, ADR-015; revisión de deuda: DT-031 a DT-038); probada en vivo por el usuario; registradas `PROC-1` y `CAND-4`; imagen de producción como deuda (DT-034). | Cargar un CV, revisarlo y crear o actualizar el candidato; el diagnóstico mostró que `files` perdía datos de contacto. |
| 2026-11-02 | `PROC-1` cerrada en código en `feature/PROC-1`: contrato `processes.ts`, backend de procesos/asociación/límites/`GET /candidates`, lista y detalle, formulario de 3 pasos, «Candidatos» en el menú, Inicio real (backend 472 unit / 178 e2e, frontend 671 tests, `validate-quality` 252 archivos 0 críticos); deuda DT-039 a DT-042. | MVP de un día con el diseño de 4 mockups; el dashboard por rol queda como tarea siguiente. |
| 2026-11-03 | Registrada `DRAFT-1` y creado `docs/use-cases/drafts.md`; registrada `OPP-AI-1` con glosario, ADR-016 (Propuesto) y `opportunities-ai.md`; altas DT-050 y DT-051. | La sesión caduca y el formulario se pierde (DT-015); la HU pide oportunidades con IA y sugerencias de la banca. |
| 2026-11-03 a 2026-11-06 | `OPP-AI-1` unidades 2 a 3.5: textos «Oportunidad» (`5678f4e`), banda entero 6 a 10 (DT-051 resuelta), módulo `shared/skills` (`68c60dd`, 25 tests), `band` en banca y `startDate` (`e1140a6`, `c5e8ac0`; 500 por mes 13 / día 32 corregido a 400); altas DT-052 a DT-054. Gates al cierre: ver «Qué falta». | Insumos del borrador con IA y del match con la banca. |
| 2026-11-08 | ROADMAP reordenado: guía de lo pendiente arriba, lo cerrado resumido al final, una sola numeración (1..11) para OPP-AI-1 | Dos numeraciones (plan vs secciones de la HU) confundían y el archivo mezclaba lo hecho con lo pendiente |
| 2026-11-08 | `OPP-AI-1` unidad 6 (sin commitear, en revisión): `POST /ai/opportunity-draft/file` (PDF/DOCX/MD/TXT en memoria, firma, 422 `OPPORTUNITY_SOURCE_UNREADABLE`, env `OPPORTUNITY_SOURCE_MAX_FILE_BYTES` 5 MiB sin confirmar); tope con default en código (`OPPORTUNITY_SOURCE_DEFAULT_MAX_FILE_BYTES`, env inválida → default + warn) y limpieza de marcadores de página en el adapter (`pageJoiner: ''`); backend 838/838 jest (88 suites), 269/269 e2e (34), lint 27 warnings (+2 de longitud en specs, DT-059), frontend 945/945 (solo una línea de copy), `validate-quality` 306 archivos 0 críticos; sin corrida real con ICA | Backend del brochure; la UI llega en la unidad 7 |
| 2026-11-08 | `OPP-AI-1` unidad 5.5: extracción de texto PDF/DOCX movida a `shared/document-text` tras `DOCUMENT_TEXT_EXTRACTOR_PORT`, sin cambio de comportamiento; backend 793/793 jest, 257/257 e2e, lint 25 warnings, `validate-quality` 304 archivos 0 críticos; causa de los 4 tests PDF: `npx jest` sin `--experimental-vm-modules`; sin ADR | Prerrequisito de la unidad 6 (brochure) para que `ai` no consuma `candidates` |
| 2026-11-08 | `OPP-AI-1` unidad 5: box mágico en la etapa 1 (solo rellena campos vacíos, «Sugerido por IA», errores por `code`); frontend 945/192 tests, lint 0 warnings, build ok (`2d750e3`); altas DT-057 y DT-058 | Consume `POST /ai/opportunity-draft`; sin recorrido en navegador ni prueba contra el endpoint real |
| 2026-11-08 | `OPP-AI-1` unidad 4: `POST /ai/opportunity-draft` (backend), timeout total, config por env, `isRealDate` a `shared` (`401336a`); alta DT-055 (FlowLog imprime cuerpos) | Insumo del box mágico (unidad 5); gates en verde y corrida real con ICA |
| 2026-11-08 | DT-055 resuelta (`576a69e`): `@NoBodyLog()` + `FlowLogInterceptor`/`FlowLogMiddleware` imprimen `{ omitted, length }` en IA y candidatos; alta DT-056 (residual) | R3: los logs de desarrollo no deben llevar texto del usuario, borradores ni PII de candidatos |

---

_Ver también: [`CLAUDE.md`](./CLAUDE.md) para las invariantes ·
[`docs/architecture/README.md`](./docs/architecture/README.md) para las decisiones ·
[`good-practices/DEBT_TECH.md`](./good-practices/DEBT_TECH.md) para la deuda técnica._

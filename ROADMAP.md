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

### Funcionalidades de la POC (la ruta que se aisló para esta etapa)

Esto no es todo el roadmap: son las piezas que se eligieron para tener un recorrido completo en la POC (reclutador crea el
proceso, asigna referente, agenda, el referente evalúa con ayuda de IA). Estado a 2026-11-02, tras el commit `d9f2e1c`.
«Verificado» dice cómo se comprobó; lo que dice «solo tests» o «no verificado» no se ha visto funcionando en vivo.

| # | Funcionalidad | Estado | Verificado |
| --- | --- | --- | --- |
| 1 | ICA como apoyo de IA (capability `ai`) | ✅ Hecha (AI-1) | En vivo por el usuario |
| 3 | Cargar CV (PDF/Word), extracción a JSON, formulario editable, candidato tentativo, actualización por correo | ✅ Hecha (CAND-2); falta solo la imagen de producción (DT-034) | En vivo por el usuario |
| 2 | Crear proceso, asociar de 1 a N candidatos, listar procesos | ✅ Hecha en código y commiteada (PROC-1) | Solo tests y e2e; falta tu recorrido en navegador y los `curl` de escritura |
| 2d | Lista de candidatos en el menú y alta de candidato sin iniciar un proceso | ✅ Hecha en código y commiteada (PROC-1) | Solo tests; `GET /candidates` en vivo exige recrear el backend |
| 2e | Detalle del proceso con acciones: editar título y cliente, agregar y quitar candidatos, cambiar reclutador, estado y cancelar | 🚧 En curso por otro agente en esta rama | No verificado por el líder |
| 2f | Regla de no más barrels y deuda de los existentes | 🚧 Pedida, junto con 2e | No verificado por el líder |
| 2c | Inicio por rol con procesos reales | 🟡 Parcial: el contador y la lista de procesos del Inicio ya son reales; faltan los dashboards propios por rol y el resto de bloques sigue con datos de prueba | Solo tests |
| 2b | Visibilidad `public/protected` de candidatos y filtrado por dueño | ⏳ Pendiente (R1-R3, fase siguiente) | — |
| 4 | Asignar referente técnico a un proceso | ⏳ Pendiente (siguiente recomendada) | — |
| 5 | Lista de referentes con disponibilidad y perfil expandible | ⏳ Pendiente (va con la 4) | — |
| 6a | Booking, vista PM o reclutador | ⏳ Pendiente | — |
| 6b | Booking, vista referente | ⏳ Pendiente | — |
| 8 | Feedback asistido por IA | ⏳ Pendiente | — |
| 7 | Estrellas y rating de referentes | ⏳ Pendiente, bajo esfuerzo | — |
| 9 | Pool externo de casi-contratados | ⏳ Pendiente, bajo esfuerzo | — |

Resumen: de 12 filas de la ruta, 4 están hechas en código (1, 3, 2, 2d), 1 es parcial (2c), 2 están en curso (2e, 2f) y 7 están
pendientes. Solo la 1 y la 3 se han visto funcionando en vivo.

**Orden sugerido para completar la POC:** 2e y 2f (en curso) → 4 y 5 juntas (referentes: no se puede asignar a quien no se
puede listar, y exigen sembrar referentes de demostración con especialidad y disponibilidad) → 6a y 6b mínimas → 8 (el
referente evalúa con ayuda de ICA, lo que más luce en la demo) → 2c (dashboards por rol, que es en su mayoría composición de
lo anterior) → 7 y 9 si sobra tiempo. La 2b queda al final salvo que la demo exija privacidad entre reclutadores.

### Features vigentes

Orden: primero lo que requiere acción, luego el backlog por prioridad, al final lo cerrado.

| ID | Estado | Prioridad | Depende de |
| --- | --- | --- | --- |
| OPP-AI-1 | 🚧 U0 (docs) ✅, 2 (textos) ✅, 2.5 (banda) ✅, 3 (skills) ✅; 3.5, U1, U2, U3 y 5.5 📌 sin arrancar: oportunidad asistida por IA (box mágico, brochure) y sugerencias de la banca | HIGH | AI-1, BENCH-1, CAND-2 |
| CAND-2 | ✅ cerrado en código y probado en vivo por el usuario en local (carga de CV con 3 modos, alta y actualización por correo con auditoría, IA vía ICA); queda solo la imagen de producción (DT-034) | HIGH | AI-1 |
| AI-1 | ✅ cerrado en código y verificado en vivo: capability `ai` (ICA) con coordinator simple; ahora también archivos y consulta con definición propia (CAND-2) | HIGH | — |
| PROC-1 | ✅ cerrado en código en `feature/PROC-1`, pendiente de tu recorrido en navegador (contrato, backend de usuarios/procesos/asociación/límites/lista de candidatos, formulario «Nuevo proceso» de 3 pasos, lista y detalle de procesos, «Candidatos» en el menú, Inicio con procesos reales; deuda DT-039 a DT-042): crear procesos, asociar de 1 a N candidatos (límite en el backend), listar procesos; PM y reclutador únicos | HIGH | CAND-2 |
| CAND-4 | 📌 sin arrancar: retirar el modo `ica` con archivo (DT-033) y mejorar el modo clásico (país, rol, experiencia) | LOW | CAND-2 |
| BENCH-1 | 🚧 verificado en vivo (stack, `curl` por rol, imagen de producción); falta el recorrido con los 3 roles | HIGH | AUTH-1, Etapa 2 |
| QW-1 | 🚧 implementado, falta el recorrido en navegador (DT-010) | HIGH | — |
| FE | 🚧 Etapas 0-2 en código; Etapa 2 pendiente de revisión en navegador | MEDIUM | — |
| DRAFT-1 | 📌 sin arrancar (registrada; recuperar formularios no enviados tras el cierre de sesión) | MEDIUM | QW-2, PROC-1, CAND-2 |
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
0. **CAND-2 (cerrado y mergeado en `main`, PR #5):** el usuario probó en su equipo, en local, la IA (ICA) y la carga de CV
   (alta, actualización por correo, datos adicionales) y funcionan bien.
1. **PROC-1 (cerrado en código, rama `feature/PROC-1`; falta tu recorrido en navegador y los commits):** crear procesos,
   asociarles de 1 a N candidatos (`MAX_CANDIDATES_PER_PROCESS` en el backend) y listarlos, con un PM y un reclutador únicos
   por proceso; «Candidatos» en el menú; Inicio con el total y la lista reales de procesos. Plan en
   `~/.claude/plans/mellow-finding-oasis.md`. El formulario sigue el diseño de `docs/design/mockups/proceso-nuevo/`
   reducido a 3 pasos (Datos, Candidatos, Confirmar). Fuera del MVP y anotado como futuro: paso de referentes (features 4 y
   5), seniority/descripción/duración/skills del rol, borradores, buscador de candidatos existentes, notificaciones
   Outlook/Slack, etapas y semáforo del proceso. **Siguiente: dashboard por rol** (Inicio propio de reclutador, PM y
   referente técnico; hoy el del referente no muestra procesos porque el API le responde 403).
2. **Decidir el modo `ica` (archivo):** recomendado retirarlo tras la demo (DT-033); es el único con el defecto de contacto
   vacío y deja CV huérfanos en ICA si la subida expira.
3. **Imagen de producción (DT-034):** no se prueba en esta POC (corre en el equipo del usuario). Queda como deuda: `pdf-parse`
   arrastra `@napi-rs/canvas` y sobre Alpine no está probado; verificarlo antes de DEPLOY-1.
4. **Recorrido en navegador con los 3 roles** (ana@, carlos@, mariana@ibm.com): cierra BENCH-1 y de paso DT-010 (F5
   conserva la sesión, ningún link da 404, aviso de inactividad a los 360 s). Con eso se pueden cerrar QW-1, AUTH-1,
   QW-2 y la Etapa 2, y las deudas DT-002, DT-007 y DT-024.
5. **Seguridad del repositorio:** la URL de `origin` lleva un token de GitHub en texto plano dentro de `.git/config`.
   Revocarlo, pasar a un credential helper o SSH y reescribir la URL sin credenciales. Además `~/.gitconfig` tiene
   `http.sslverify=false`.
6. **Decidir qué hacer con los 21 commits con `Co-Authored-By`:** ya están en `origin`, así que quitarlos exige `--force`,
   descartado hasta nueva orden. Los commits de CAND-2 no llevan esa línea.
7. **Replanning Bench First** (ADR, `docs/domain.md`, casos de uso, `shared-types`) y `MATCH-1`. Al replanificar hay que
   actualizar `/roadmap-task` (DT-025). Opcionales: OBS-2, DT-020 y las deudas DT-027 a DT-038.

**Gates (2026-11-02, tras CAND-2):** backend 394 unit / 139 e2e (antes 112 / 74), lint 0 errores / 14 warnings, build OK;
frontend 489 tests (antes 375), lint 0 errores (2 warnings preexistentes en `sessionCacheGuard.test.tsx`; el script
`npm run lint` usa `--max-warnings 0` y por eso sale en rojo), build OK; `validate-quality --strict` 0 críticos sobre 177
archivos. Verificado en vivo por el usuario en local (ICA real, Mongo y navegador); la imagen de producción no se prueba (DT-034).

**Gates de PROC-1 (2026-11-02, re-ejecutados por el líder):** línea base 394 unit / 139 e2e (backend) y 489 tests (frontend). Al cierre: backend typecheck limpio, lint 0 errores / 14 warnings, 472 unit / 178 e2e, build OK con 0 `.js` que importen `shared-types`; frontend typecheck limpio, lint 0 errores / 2 warnings, 671 tests, build OK; `validate-quality --strict` 0 críticos sobre 252 archivos. **No verificado:** todo lo visual y el navegador; los `curl` de escritura (crear proceso, asociar y quitar candidatos) solo están cubiertos por los e2e; el arranque real con el código de `GET /candidates` (el contenedor del backend debe recrearse).

**Git:** rama `feature/PROC-1` (sale de `main` tras el merge de CAND-2), sin push. `origin` apunta a
`klysweribm/talent-bridge-now`; nunca `--force`.

---

## 🚧 En curso y por verificar

> Lo que sigue abierto. Orden: lo más importante primero.

## OPP-AI-1 — Oportunidad asistida por IA y sugerencias de la banca (HIGH)

**Estado:** 🚧 U0 (documentación), 2 (textos), 2.5 (banda) y 3 (skills) ✅, todas sin commit; el resto 📌 sin arrancar · rama `feature/DT-01` · **Casos de uso:** [`docs/use-cases/opportunities-ai.md`](./docs/use-cases/opportunities-ai.md) (R1-R7) · **Lenguaje:** [`docs/glossary.md`](./docs/glossary.md) · **Decisión:** ADR-016 (Propuesto) · **Depende de:** AI-1, BENCH-1, CAND-2 · **Deuda:** DT-050, DT-051

El PM o reclutador describe el perfil en un box mágico o sube un brochure; la IA (ICA) rellena el formulario de la oportunidad sin crear nada, y en la etapa 2 se sugieren recursos de la banca con un % de match calculado por el backend.

| Unidad | Alcance | Estado |
| --- | --- | --- |
| U0 | Documentación: glosario, ADR-016, caso de uso `opportunities-ai.md` | ✅ hecha (solo documentación, sin commit; no aplica navegador) |
| 2 | Textos «Proceso» → «Oportunidad» en la interfaz (copy por feature) | ✅ hecha (verificado: 889 tests, typecheck, lint, `validate-quality --strict`; sin commit; no verificado: navegador) |
| 2.5 | Documentación por la banda: la banda es un entero 6 a 10 (no jr/ssr/sr/lead); el match compara banda con banda; cierra DT-051 | ✅ hecha (solo documentación, sin commit; no aplica navegador) |
| 3 | Módulo de skills: catálogo canónico con alias en `apps/backend/src/shared/skills/` (`normalizeSkill`, `normalizeSkills`, `skillKey`, `sameSkill`; sin barrel) | ✅ hecha (verificado: spec de 25 tests en verde con TDD, typecheck, lint 0 errores / 20 warnings como la línea base, `validate-quality --strict` 291 archivos 0 críticos; sin commit; aún nadie lo importa, lo consumen U1 y U2; no verificado: nada en vivo) |
| 3.5 | `band` (6 a 10) en cada recurso de banca y `startDate` en la oportunidad (contrato en `shared-types`, mock de banca, schema y DTO) | 📌 sin arrancar |
| U1 | Borrador de oportunidad con IA: `POST /ai/opportunity-draft` y `/file`, box mágico y brochure | 📌 sin arrancar |
| 5.5 | Refactor backend: `src/shared/document-text` detrás de un puerto, consumido por `candidates` y `ai`; commit propio | 📌 sin arrancar |
| U2 | Match de la banca: `POST /bench/match` y `GET /processes/:id/bench-suggestions` (incluye 5.5) | 📌 sin arrancar |
| U3 | Panel «Sugeridos de la banca» en la etapa 2 y en el detalle, con explicación de la IA | 📌 sin arrancar |

### Criterios de éxito

**U0**
- [x] Glosario, ADR-016 (Propuesto) y caso de uso con Gherkin y R1-R7 escritos y enlazados desde `CLAUDE.md` y `docs/use-cases/README.md`.
- [ ] Términos marcados [POR VALIDAR CON LUC/GUS] confirmados por el negocio.

**Unidad 2 (textos)**
- [x] Menú, títulos y botones dicen «Oportunidad»; rutas y API siguen en `processes` (escenario «Textos visibles»). Verificado por tests; falta el recorrido en navegador.

**Unidad 2.5 (banda)**
- [x] Glosario, `opportunities-ai.md`, criterios y DT-051 usan «banda» (entero 6 a 10); sin tabla jr/ssr/sr/lead.

**Unidad 3 (skills)**
- [x] El módulo normaliza «Reactjs» y «Nestjs» a «React» y «NestJS» y conserva las desconocidas (25 tests unitarios). Falta el escenario «Skills normalizadas» de extremo a extremo, que depende de U1 y U2.

**Unidad 3.5 (banda en la banca y fecha de inicio)**
- [ ] Cada recurso de banca lleva `band` (6 a 10) y la oportunidad admite `startDate` opcional.
- [ ] Los filtros actuales de `GET /bench` (incluido `seniority`) no cambian; el match usa `band`, no `seniority` (ver `docs/use-cases/bench.md`).

**U1 (borrador con IA)**
- [ ] Texto libre rellena título, cliente, banda y stack, con «Sugerido por IA», y no se crea nada hasta «Crear oportunidad» (R1).
- [ ] Lo que la IA no infiere queda vacío con aviso de campos por completar (R2).
- [ ] Brochure PDF rellena igual, y no se guarda en servidor ni en logs (R3).
- [ ] PDF sin texto extraíble: «No pudimos leer el documento» (`OPPORTUNITY_SOURCE_UNREADABLE`, 422) y el formulario queda intacto.
- [ ] Si ICA falla, mensaje claro y el formulario se completa a mano (R6; `AI_UNAVAILABLE`, `AI_TIMEOUT`).
- [ ] Referente técnico 403 y sin token 401 en `POST /ai/opportunity-draft`.

**5.5 (refactor)**
- [ ] `shared/document-text` detrás de un puerto, consumido por `candidates` y `ai`, en commit propio y con los tests de CAND-2 en verde sin cambios de comportamiento.

**U2 (match backend)**
- [ ] % determinístico (60 % skills, 25 % banda, 15 % disponibilidad), independiente de ICA (R4). Banda: misma 100, diferencia de 1 → 50, resto 0; requiere la unidad 3.5.
- [ ] Sin `startDate`: «Disponibilidad: no evaluada» y pesos redistribuidos (R5).
- [ ] Solo recursos `available` o `soft_booked`, sin acción de asignar (R7).
- [ ] ICA solo recibe skills, nivel, banda y disponibilidad; nunca nombre, código ni contacto (R4).
- [ ] Referente técnico 403 y sin token 401 en `POST /bench/match`.

**U3 (panel)**
- [ ] «Sugeridos de la banca» ordenados por % en la etapa 2; 75 % o más con «Recomendado»; skills que cumple y que le faltan.
- [ ] Con ICA caído se ven % y desglose, sin la frase de la IA.
- [ ] Sin coincidencias: «Sin coincidencias suficientes en la banca» y «Buscar candidatos externos».
- [ ] Cambiar el perfil recalcula las sugerencias.
- [ ] El mismo panel aparece en el detalle de la oportunidad creada.

**Verificado:** unidad 3 con tests unitarios y gates estáticos (ver tabla); el resto es documentación. **No verificado:** nada en vivo ni en navegador.

**Open risks:**
- Jest backend (2026-11-05): 647 pasan / 4 fallan, preexistentes y ajenos a OPP-AI-1: `classic-cv-extractor.adapter.spec` y `local-cv-text-extractor.adapter.spec` (CAND-2, lectura de PDF en `candidates`). Se abordan en la unidad 5.5; antes `local-cv-text-extractor` fallaba 2/7 solo al correrlo aislado y pasaba en la suite completa, causa sin investigar. Hasta entonces el gate de jest no queda en verde.

---

## CAND-2 — Candidato externo desde CV (3 extractores, alta y actualización) (HIGH)

**Estado:** ✅ cerrado: implementado, con tests y probado en vivo por el usuario en local (2026-11-02) · rama `feature/CAND-2` · **Complejidad:** 🔴 Alta · **Casos de uso:** UC-CAND-5 y UC-CAND-6 en [`docs/use-cases/candidates.md`](./docs/use-cases/candidates.md) · **Decisión:** ADR-015

Cargar un CV (PDF o DOCX), extraer un `ICandidateProfileDraft` y mostrarlo en un formulario editable; solo al confirmar
se crea el `Candidate` tentativo. Tres extractores seleccionables con el mismo esquema: `ica-text` (principal, el backend
extrae el texto y lo manda a ICA en línea), `classic` (reglas locales completadas con ICA, y que sigue funcionando si ICA
cae) e `ica` (archivo vía `files`, solo para comparar). `/processes/new` es una cuadrícula de cajas; solo la Caja 1 es
funcional.

**Decisiones:** `pdf-parse` + `mammoth` para el modo clásico; reintento en Clásica con botón explícito, sin cambio
silencioso; la extracción no persiste; PII a ICA aceptada para la POC (DT-030) con mitigaciones baratas
(`.claude/rules/cv-pii-handling.md`); `Candidate` con `cvUrl` opcional y `status`.

**Criterios de éxito:**
- [x] Contrato en `shared-types` (`candidates.ts`) con typecheck verde en backend y frontend.
- [x] ADR-015 y UC-CAND-5 / UC-CAND-6.
- [x] Spike de ICA `files` y diagnóstico en vivo (2026-11-01): `files` no entrega el documento completo al modelo; el texto en línea sí (ver ADR-015).
- [x] Variable `CV_MAX_FILE_BYTES` en `.env.example` y compose; `.env.example` ordenado por proyecto.
- [x] Extensión aditiva de `ai` (subir, esperar, borrar, consulta con definición propia) con el coordinator sin lanzar.
- [x] `POST /candidates/cv-extraction` con los tres modos, roles y 503 sin 401; el modo clásico nunca devuelve 503.
- [x] `POST /candidates` con email único y `status: 'tentative'`, y `PUT /candidates/:id` con reemplazo total.
- [x] Pantalla `/candidates/new` y cuadrícula en `/processes/new` (Caja 1 funcional).
- [x] Defectos de la revisión corregidos: regex cuadráticas, límites del parser, `@TraceFlow()` en `complete`, skills con comas, mock apagado por defecto, correo fijo al actualizar, scripts de Jest para la CI.
- [x] Prueba en vivo en local, hecha por el usuario (2026-11-02): la IA vía ICA y la carga de CV funcionan bien con CV reales (modos de extracción, alta y actualización).
- [x] Alta y actualización contra Mongo probadas en local por el usuario.
- [ ] Imagen de producción con un PDF (DT-034): **fuera de la POC**, queda como deuda; se verifica antes de DEPLOY-1.

**Mejoras pedidas (2026-11-01):**
- [x] **Tamaño del archivo en la pantalla de carga:** mostrar el peso del archivo elegido y el límite que debe respetar (hoy 5 MiB, `VITE_CV_MAX_FILE_BYTES`, mismo valor que `CV_MAX_FILE_BYTES` del backend). Avisar antes de enviar si lo excede.
- [x] **Datos adicionales del candidato (pendiente verificar en Mongo y en el navegador):** mostrar, debajo del formulario y con buen formato, lo que el CV aporta y el formulario no edita: `summary` (resumen), `experience` (experiencia) y `education` (educación), además de `languages`. Es solo lectura, como información para el PM o el reclutador; no se agrega al formulario de creación.
  - La persistencia ya existe: `POST /candidates` guarda `summary`, `experience`, `education` y `languages` en Mongo asociados al candidato (y el frontend los reenvía desde el borrador). Falta verificar en la base que quedan guardados tras crear un candidato real.
  - Son opcionales, pero enriquecen el perfil y se podrán usar en otras etapas (listado y detalle de candidatos, match).
  - Depende de que el extractor devuelva esos campos: ICA ya los llena; el modo clásico no (queda para su mejora).
- [x] **Extracción de ICA incompleta (resuelta y probada en vivo por el usuario):** diagnosticado (ADR-015): `files` no entrega el documento completo al modelo; el texto en línea sí. Implementados `ica-text` y el clásico completado con ICA. Pendiente: prueba en vivo del backend real con los tres modos, tiempos y la actualización de perfiles.

**CAND-2b — Actualizar un perfil desde un CV más nuevo (cerrado):**
- [x] `PUT /candidates/:id` con reemplazo total; conserva correo, estado, creador y fecha de creación.
- [x] Auditoría: `createdBy`, `updatedBy` (id, correo y rol del JWT, nunca del cuerpo), `updateCount`.
- [x] Aviso suave antes de editar si el correo ya existe (`matches.exact`) y aviso no bloqueante de perfiles parecidos (`matches.similar`: mismo nombre normalizado o mismos últimos 8 dígitos del teléfono).
- [x] Revisión profunda de deuda técnica: hallazgos verificados, defectos corregidos y el resto registrado como DT-031 a DT-038.
- [x] Probado en vivo por el usuario en local: crear el perfil, volver a cargar el CV y actualizarlo.
- Límites: la escritura manual no muestra el aviso de parecidos; los candidatos anteriores no tienen claves de búsqueda (DT-032); el RUT queda como campo opcional futuro (decisión con compliance).
- Pendiente de decidir: mostrar «PM» en vez de «Project Manager» en el aviso de quién actualizó.

**Fuera de alcance (siguiente):** asociar varios candidatos a un proceso (PROC-1); listado y detalle de candidatos; Cajas 2 y 3;
persistencia del archivo (COS); pool externo; deduplicación avanzada; reintentos automáticos entre extractores; OCR;
`stream`. **Caja 3 (especificación pendiente):** unidad de negocio (consulting, tech, infra), cliente, descripción,
rol, expertise, contacto en el cliente (opcional), código de proyecto (opcional), PM del proyecto (opcional) y plazos
de contratación.

---

## AI-1 — Capability `ai`: coordinador de IA vía ICA (HIGH)

**Estado:** ✅ cerrado en código y verificado en vivo (2026-11-01), sin commitear · **Complejidad:** 🟡 Media · **Casos de uso:** [`docs/use-cases/ai.md`](./docs/use-cases/ai.md) · **Decisión:** ADR-014

Servicio inyectable (`AiModule`) al que cualquier capability envía una consulta y recibe una respuesta, con **tópicos**
por segmento (hoy solo `general`). Es el cimiento de la POC: el CV a JSON, el match con la banca y el feedback asistido
lo consumen. Reutiliza el proveedor ICA de `architecture-reviewer-app` (mapper, reintento, reparación de JSON).

**Decisiones:** ICA sustituye a watsonx.ai como proveedor (solo el adapter cambia si se revierte); el coordinator nunca
lanza (`{ ok, ... }`) y los fallos de ICA salen como 503, nunca 401; seguridad falla cerrado, disponibilidad falla
suave; proveedor `fake` solo por `AI_PROVIDER=fake`, sin respaldo automático; salida estructurada (`jsonMode` + esquema)
desde el inicio; `ICA_SPACE_ID` se retira; modelo por defecto `claude-haiku-5-5`. PII a ICA: aceptada para la POC
(DT-030).

**Criterios de éxito:**
- [x] Contrato en `shared-types` (`ai.ts`), ADR-014, casos de uso y DT-030.
- [x] Variables en `.env.example` y compose por interpolación (`${ICA_API_KEY:-}`), sin clave en `docker-compose.test.yml` (solo `AI_PROVIDER: fake`).
- [x] Puerto, adapter ICA, mapper, reintento con backoff y reparación de JSON, con TDD (unit en Jest con `fetch` simulado).
- [x] Coordinator que nunca lanza, con tope de tiempo total (`AI_TOTAL_TIMEOUT_MS`) y tópico `general`.
- [x] `GET /ai/status` valida clave y modelo (`MODEL_NOT_FOUND`) sin exponer la clave; `POST /ai/ask` acotado (10/min, `query` ≤ 4000, tópicos en lista cerrada).
- [x] e2e: 401 / 403 / 400 / 200 / 503; con el proveedor fallando, `/bench` y `/auth` responden normal.
- [x] Gates (2026-11-01): backend 242 unit / 89 e2e, lint 0 errores / 14 warnings (sin nuevos), build OK, `validate-quality --strict` 0 críticos sobre 114 archivos.
- [x] Arranque real con y sin clave: con clave `/ai/status` da `available: true` (`claude-haiku-5-5`) y `/ai/ask` 200; sin clave arranca (WARN `AI disabled`), `/health` `database: up`, `/ai/status` `NOT_CONFIGURED`, `/ai/ask` 503 y `/bench` 200. Pendiente: el caso de modelo inexistente (`MODEL_NOT_FOUND`) solo está cubierto por tests.
- [x] Llamadas reales a ICA: `/ai/ask` (3,3 s) y `response_format: json_object` con un esquema de CV, que validó. Con `max_tokens` bajo (200) el JSON salió truncado (`finish_reason: length`); el tope por defecto de la app pasó a 8192 (el modelo admite 128000 y genera ~150 tokens/s), con timeouts de 60 s por llamada y 90 s en total. Sin verificar en vivo: el backend en ejecución aún no recargó esos valores. El tópico con esquema pasando por el servicio queda para AI-2.
- [x] La clave no aparece en ningún archivo versionado ni sin ignorar (0 coincidencias) ni en los logs del contenedor (0).

**Límites que deja:** sub-agentes y tool-calling (`TODO(AI-2)`), tópicos de oportunidad / CV / feedback, subida de CV y
`files`, `stream`, almacén de credencial en memoria, persistencia de conversaciones. Alcance de ICA desde Code Engine
`br-sao` sin verificar (riesgo de DEPLOY-1).

---

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

## DRAFT-1 — Recuperar trabajo no enviado tras el cierre de sesión (MEDIUM)

**Estado:** 📌 sin arrancar (solo registrada; no implementar sin plan aprobado) · **Prioridad:** MEDIUM · **Complejidad:** 🟡 Media · **Casos de uso:** [`docs/use-cases/drafts.md`](./docs/use-cases/drafts.md)

### Motivación

La sesión se cierra por inactividad (aviso a los 360 s) o por expiración del JWT, y la caché de React Query se vacía al
terminar la sesión (DT-015). Un formulario largo (nuevo proceso, agregar candidato, feedback) se pierde completo.

### Alcance

- **Backend:** capability `drafts`. Colección `drafts { userId, formKey, entityId?, payload, schemaVersion, updatedAt }`,
  índice único `{ userId, formKey, entityId }` e índice TTL por `DRAFT_RETENTION_DAYS` (defecto 7, `ConfigService`).
  Endpoints: `PUT /drafts/:formKey` (upsert), `GET /drafts/:formKey`, `DELETE /drafts/:formKey` y `GET /drafts` (lista del
  usuario). Siempre filtrado por el `userId` del JWT; nunca se accede al borrador de otro.
- **Frontend:** hook reutilizable `useFormDraft(formKey)`. Autoguardado con debounce (`DRAFT_AUTOSAVE_MS`, defecto 3000) y
  guardado forzado antes del cierre por inactividad o expiración. Al volver, banner «Tienes un borrador del <fecha>:
  Recuperar / Descartar».
- **Formularios iniciales:** nuevo proceso, editar proceso y agregar candidato. Feedback se suma cuando exista.

### Decisiones

- El borrador **no crea ni modifica entidades**: solo al confirmar se guarda el proceso o el candidato, y entonces el
  borrador se elimina.
- Nunca se guarda el archivo del CV: solo los campos extraídos o escritos.
- El `payload` se valida contra `schemaVersion`; si el formulario cambió de versión, el borrador se descarta con aviso,
  nunca se carga a medias.
- Logout manual: pregunta «¿Conservar borrador?». Inactividad o expiración: se conserva siempre.
- Sin PII en logs: solo `userId`, `formKey` y tamaño.

### Dependencias

QW-2 (idle timer y logout), PROC-1 (formularios de proceso) y CAND-2 (formulario de candidato).

### Preguntas abiertas

1. ¿Un borrador por formulario o varios (por ejemplo, dos procesos a medio crear)? Defecto: uno por formulario nuevo y uno
   por entidad en edición.
2. ¿Qué pasa si, al recuperar la edición, la entidad cambió en el servidor? Defecto: avisar «el proceso cambió desde tu
   borrador» y dejar elegir.
3. ¿Se muestra un widget «Borradores pendientes» en el Inicio? Defecto: sí, prioridad LOW.

### Criterios de éxito

- [ ] Tras un cierre por inactividad o expiración, al volver a «Nuevo proceso» se ofrece recuperar el borrador con su fecha.
- [ ] «Descartar» vacía el formulario y elimina el borrador; confirmar el proceso o el candidato también lo elimina.
- [ ] El borrador no crea entidades (un borrador de «Agregar candidato» no aparece en Candidatos).
- [ ] Aislamiento: el borrador de un usuario es inaccesible para otro (e2e con dos usuarios; 401 sin token).
- [ ] Un borrador con `schemaVersion` anterior se descarta con aviso y no carga datos a medias.
- [ ] Vence a los `DRAFT_RETENTION_DAYS` días (índice TTL) y no se ofrece al volver.
- [ ] El archivo del CV nunca viaja al borrador; al recuperar hay que volver a adjuntarlo para reanalizarlo.
- [ ] Logout manual con cambios sin enviar pregunta «¿Conservar borrador?»; la inactividad y la expiración conservan siempre.
- [ ] Los logs no contienen datos del formulario (solo `userId`, `formKey` y tamaño).

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
| 2026-10-31 | `AI-1` iniciada: capability `ai` con proveedor ICA (ADR-014), contrato en `shared-types`, casos de uso y alta de DT-030 (PII hacia ICA). | La POC del fin de semana necesita IA en CV, match y feedback; ICA sustituye a watsonx.ai como proveedor. |
| 2026-11-01 | `CAND-2` iniciada: contrato `candidates.ts` en `shared-types`, ADR-015, UC-CAND-5 y regla `cv-pii-handling`. Spike de ICA `files` pendiente (bloqueado por permisos de `curl`). | La POC necesita crear candidatos externos desde un CV, con extracción por ICA o clásica y revisión humana antes de crear. |
| 2026-11-02 | `CAND-2` implementada: tres extractores (`ica-text`, `classic` completado con ICA, `ica`), alta y actualización por correo con auditoría y avisos de coincidencia, datos adicionales y tamaño del archivo en la pantalla de carga. Revisión de deuda técnica: corregidos regex cuadráticas, límites del parser, `@TraceFlow()` de `complete`, skills con comas, mock por defecto, correo fijo al actualizar y scripts de Jest para la CI; registradas DT-031 a DT-038. | Se pidió cargar un CV, revisarlo y crear o actualizar el candidato; el diagnóstico en vivo mostró que `files` perdía los datos de contacto y la revisión encontró defectos reales antes de commitear. |
| 2026-11-02 | `CAND-2` cerrada: el usuario probó en local la IA y la carga de CV con CV reales y funcionan bien. Registrada `PROC-1` (procesos con varios candidatos, MVP de un día) y `CAND-4` (retirar el modo `ica`, mejorar el clásico). La imagen de producción queda como deuda (DT-034) y no se prueba en la POC. | Siguiente feature pedida: varios candidatos por proceso, con PM y reclutador únicos. |
| 2026-11-02 | `PROC-1` arrancada en `feature/PROC-1`: línea base de gates re-ejecutada, contrato `processes.ts` en `shared-types` (más `ICandidate.processId`), `docs/use-cases/processes.md` reescrito con R5-R9 y Gherkin, nota P1 en ADR-013. | Plan aprobado por el usuario; el backend y el frontend siguen, un subagente a la vez. |
| 2026-11-02 | `PROC-1`: backend de usuarios, procesos y asociación de candidatos (457 unit / 171 e2e), refactor de `Pagination` y estados de lista a `shared/`, lista y detalle de procesos (525 tests); un solo botón «+ Nuevo proceso». Diseño del formulario adoptado desde 4 mockups: 3 pasos sobre un solo formulario, 0 candidatos permitido, tope vía `GET /processes/limits`; mockups y §3.4 de UX-GUIDELINES guardados en `docs/design/`. | El usuario aportó los mockups del wizard y pidió un MVP que use solo lo que ya se puede construir. |
| 2026-11-02 | `PROC-1` cerrada en código: formulario «Nuevo proceso» de 3 pasos, `GET /processes/limits`, `GET /candidates` (nombre, rol, correo, estado, fecha; sin teléfono), «Candidatos» en el menú de reclutador y PM (en móvil «Reportes» sale de la barra), Inicio con el total y la lista reales de procesos (una sola fila `ProcessItem` compartida con `/processes`) y sin etapa ni semáforo, que el proceso real no tiene. Deuda registrada: DT-039 a DT-042. | Peticiones del usuario tras revisar la UI: ver candidatos sin iniciar un proceso y datos reales en el Inicio; el dashboard por rol queda como tarea siguiente. |
| 2026-11-03 | Registrada `DRAFT-1` (recuperar trabajo no enviado tras el cierre de sesión) y creado `docs/use-cases/drafts.md`; solo documentación, sin código. | La sesión caduca por inactividad o JWT y la caché se vacía (DT-015): un formulario largo se pierde completo. |
| 2026-11-03 | Registrada `OPP-AI-1` con U0 (documentación) hecha: `docs/glossary.md`, ADR-016 (Propuesto) y `docs/use-cases/opportunities-ai.md`; unidades 2, 3, U1, 5.5, U2 y U3 sin arrancar; altas DT-050 y DT-051. | La HU pide crear oportunidades con IA y sugerir recursos de la banca; antes se fijó el lenguaje y las reglas. |
| 2026-11-03 | `OPP-AI-1` unidad 2 hecha (sin commit, rama `feature/DT-01`): textos visibles «Proceso» → «Oportunidad» en 16 archivos de producción del frontend (copy, constantes, navegación, migas, rutas, Inicio) y 21 de test; rutas, tipos, endpoints y colecciones intactos. Gates: 889 tests, typecheck, lint y `validate-quality --strict` (291 archivos, 0 críticos) en verde; recorrido en navegador sin verificar. | Alinear el lenguaje de la interfaz con el glosario antes de construir el borrador con IA. |
| 2026-11-05 | `OPP-AI-1` unidades 2.5 y 3 hechas (sin commit, rama `feature/DT-01`): la banda es un entero 6 a 10 y el match compara banda con banda (DT-051 resuelta); nuevo `apps/backend/src/shared/skills/` (catálogo con alias, 25 tests, sin barrel, aún sin consumidores). Gates backend: typecheck y lint (0 errores / 20 warnings) limpios, `validate-quality --strict` 291 archivos 0 críticos, jest 647 pasan / 4 fallan (preexistentes, specs de CV en `candidates`). Registrada la unidad 3.5 (`band` en la banca y `startDate`). Nada verificado en vivo. | Decisión del usuario: en IBM la banda son números; el catálogo de skills lo consumen U1 y U2. |

---

_Ver también: [`CLAUDE.md`](./CLAUDE.md) para las invariantes ·
[`docs/architecture/README.md`](./docs/architecture/README.md) para las decisiones ·
[`good-practices/DEBT_TECH.md`](./good-practices/DEBT_TECH.md) para la deuda técnica._

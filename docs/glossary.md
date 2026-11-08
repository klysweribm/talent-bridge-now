# Glosario del dominio

Única fuente del lenguaje del dominio. Si un término de la interfaz, del código o de la documentación contradice esta tabla, gana esta tabla. Los tipos viven en `packages/shared-types`; las decisiones de fondo, en `docs/architecture/README.md`.

Marca **[POR VALIDAR CON LUC/GUS]**: el término o su definición no está confirmado por el negocio. Se usa tal cual hasta que se valide, y cualquier cambio se refleja aquí primero.

## Términos

| Término UI | Término en código | Definición | Ejemplo |
| --- | --- | --- | --- |
| Oportunidad | `Process` (`IProcess`, ruta `/processes`, colección `processes`) | Búsqueda de talento abierta para un cliente y un perfil. Agrupa candidatos, equipo técnico y estado. En el código sigue llamándose proceso (ADR-016). | "Fullstack sr para ITAU" |
| Banca / Recurso de banca | `BenchResource` (`IBenchResource`, capability `bench`) | Empleado de IBM sin proyecto asignado, con skills, banda y fecha de disponibilidad. Los datos son ficticios y sin PII. | `BN-0001`, banda 8, React con nivel de skill 4, disponible desde 2026-11-05 |
| Candidato | `Candidate` (capability `candidates`) | Persona externa a la banca cuyo perfil se cargó (normalmente desde un CV). Se identifica por correo (ADR-004). Nace `tentative`. | Perfil creado desde `cv_lopez.pdf` |
| Talent Pool | — (sin tipo propio hoy) | Conjunto de candidatos cargados, independiente de cualquier oportunidad. **[POR VALIDAR CON LUC/GUS]**: si incluye o no a la banca. | Pantalla "Candidatos" |
| PM dueño | `ownerPmId` | PM responsable de la oportunidad. Es el único que cambia el reclutador asignado. | `mariana@ibm.com` |
| Reclutador asignado | `recruiterId` | Reclutador que gestiona candidatos de la oportunidad. Puede ser `null`. Puede cerrar o cancelar. | `ana@ibm.com` |
| Referente técnico | rol `technical_ref` | Persona que evalúa técnicamente a los candidatos. Una oportunidad admite hasta 2 (`technicalRefIds`). No tiene acceso a IA ni a la banca. | `carlos@ibm.com` |
| Equipo técnico | `technicalRefIds` / `technicalRefs` | Los referentes técnicos asignados a una oportunidad. | 2 referentes de banda 8 |
| Banda profesional | `band` (entero 6 a 10) | Nivel profesional de IBM, un número entero. Lo piden las oportunidades y lo tienen los recursos de banca y los referentes técnicos. En la interfaz y en el match se usa la banda, nunca etiquetas como jr o sr. | `band: 8` |
| Perfil buscado | `opportunityRole`, `skills`, `band`, `roleDescription` | Lo que la oportunidad pide: rol, stack, banda y expectativas de evaluación técnica. Es la entrada del match. | "Fullstack", React y NestJS, banda 8 |
| Expectativas de evaluación técnica | `roleDescription` | Texto libre con lo que se evaluará técnicamente. Es el campo que la IA rellena a partir del brochure. | "Diseño de APIs REST, pruebas, AWS" |
| Brochure | — (archivo temporal, nunca se guarda) | Documento (PDF, DOCX, MD o TXT) que describe la oportunidad. Se lee en memoria para generar el borrador y se descarta. | `Requerimiento_ITAU.pdf` |
| Box mágico | — (componente de la etapa 1) | Área de texto donde se describe el perfil libremente y la IA propone un borrador del formulario. No crea nada. | "Fullstack senior React y NestJS para ITAU…" |
| Borrador de oportunidad | `IOpportunityDraft` (a crear) | Propuesta de la IA que rellena el formulario. Cada campo inferido se marca "Sugerido por IA" hasta que una persona lo edite o confirme. | Título, cliente, stack |
| Match / % de match | — (a crear en `bench`) | Puntaje de 0 a 100 entre un recurso de banca y el perfil buscado. Lo calcula el backend de forma determinística (60 % skills, 25 % banda, 15 % disponibilidad); la IA nunca lo calcula. | 82 % |
| Recomendado (umbral) | `MATCH_THRESHOLD` (75 por defecto) | Etiqueta de un recurso cuyo match alcanza el umbral. Por debajo se muestra igual, sin etiqueta. | Recurso con 80 % |
| Skill canónica | catálogo en `src/shared/skills/` | Nombre único de una skill, con alias que se normalizan a él. Las skills desconocidas se conservan tal cual. | `Reactjs` → `React` |
| Etapa | — | Paso del flujo: 1 Creación, 2 Entrevistas (2.1 Booking), 3 Feedback, 4 Informes. | "Etapa 2" |
| Entrevista | — (INT-1, sin construir) | Encuentro técnico entre un candidato y un referente técnico dentro de una oportunidad. | Entrevista del 12-dic |
| Booking | — (etapa 2.1, sin construir) | Reserva de horario para una entrevista. **[POR VALIDAR CON LUC/GUS]** | Reserva de 45 min |
| Feedback | — (FEED-1, sin construir) | Evaluación escrita del referente técnico sobre un candidato tras la entrevista. | "Recomendado con reservas" |
| Informe | — (REP-1, sin construir) | Reporte para el cliente con el resultado de la oportunidad. | Informe de cierre |
| Estado de la oportunidad | `TProcessStatus` | `open`, `in_progress`, `interviewing`, `closed`, `cancelled`. `closed` y `cancelled` son terminales. "Eliminar" en la interfaz es cancelar. | `interviewing` |

## Regla de uso

- La interfaz dice **Oportunidad**; el código, las rutas, los endpoints y las colecciones dicen **Process**.
- Un término nuevo se agrega aquí en el mismo commit que lo introduce.

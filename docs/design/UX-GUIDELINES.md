# UX Guidelines — MVP IBM Talent Bridge

> **Fuente única de especificación de UX del MVP.** Los mockups locales de
> `DESIGN/` no son fuente de diseño: donde contradigan este documento, manda este
> documento. Los valores de los tokens salen del código (§4). Principio rector: **cada
> pantalla responde "¿qué tengo que hacer ahora?"**, no "¿cuántas métricas
> puedo mostrar?". Si un elemento no habilita una acción o una decisión, sale.
>
> Origen: revisión de diseño del 2026-10-15 (10 pantallas). Ver "Auditoría de
> mockups" al final.

---

## 1. App shell (uno solo, para todas las pantallas)

Basado en la variante `dashboard_reclutador_versi_n_simplificada_2`.

| Zona | Contiene | No contiene |
| --- | --- | --- |
| Sidebar (w-64, colapsable) | Logo + "IBM Talent Bridge" · navegación por rol · al pie: avatar, nombre, rol, "Cerrar sesión" | Tarjeta de perfil arriba, "Centro de Soporte", toggle claro/oscuro |
| Topbar | Breadcrumb | Búsqueda global, campana de notificaciones, ícono de ayuda |
| Contenido | Título de página (24px) + **una** acción primaria a la derecha | Eyebrows ("Visión Operativa • Q1"), saludos personalizados |

- Una sola marca en toda la app: **IBM Talent Bridge**. Nunca "IBM Consulting Hub", "Consulting Ops", etc.
- Mobile: bottom nav con los mismos ítems del rol (máx. 5) en lugar de sidebar.

## 2. Navegación del MVP

Fuente de verdad en código: `apps/frontend/src/shared/config/navigation.ts`.

| Ítem | Ruta | Roles |
| --- | --- | --- |
| Inicio | `/dashboard` | recruiter, technical_ref, pm |
| Banca | `/bench` | recruiter, pm |
| Procesos | `/processes` | recruiter, pm |
| Entrevistas | `/interviews` | recruiter, technical_ref |
| Feedback | `/feedback` | technical_ref |
| Reportes | `/reports` | recruiter, pm |

**Fuera de la navegación del MVP:**

- **Candidatos:** se gestionan dentro del proceso y en el paso 3 del wizard; el banco de perfiles global llega con CAND-1.
- **Referentes:** es el selector del paso 2 del wizard.
- **Configuración** y **Notificaciones:** no existen en el MVP.

## 3. Pantallas

### 3.1 Login (FE-OTP-1)

- **Contiene:**
  - Logo y título.
  - Campo "Correo corporativo" (`@ibm.com`).
  - **Un solo** método de acceso: email → código de 6 dígitos.
  - Estado de error.
- **Panel de marca:** logo, título y **una** frase de valor. Nada más: sin testimonios ni preview del producto.
- **Fuera:**
  - Badge "SSO Activo" junto a un login por password; si se usan dos métodos, se contradicen.
  - Pie "TLS 1.3 / IBM Trust Gateway", banner "Detección automática de perfil" y fondo decorativo de puntos.
  - "Recordar este dispositivo".

### 3.2 Inicio — reclutador (Etapa 2)

1. Título "Inicio" + botón primario **"Nuevo Proceso"** (uno solo).
2. **3 contadores accionables**, cada uno clickeable y con link a su lista filtrada: *Procesos activos*, *Entrevistas hoy*, *Feedback pendiente*.
3. **"Requiere atención"**: procesos sin referente asignado y feedback vencido (> 48 h). Si está vacío: "Todo al día".
4. **Procesos activos**: una fila por proceso con nombre, cliente, etapa, N.º de candidatos, estado (en tiempo / en riesgo) y link al detalle. Máximo 5, más "Ver todos".
5. **Entrevistas de hoy**: candidato, proceso, hora, referente, estado y **una** acción (abrir enlace o enviar recordatorio).

**Fuera:** "Contrataciones Q1 / Meta", flechas de tendencia ("+2 este mes"), "Filtro Global", búsqueda en la lista, menú ⋮ sin acciones definidas y sub-métricas sin fuente de datos ("83% calificados").

**Inicio de referente técnico:** "Feedback pendiente" + "Mis entrevistas de hoy". **Inicio de PM:** "Procesos activos" + "Reportes listos". Se construyen con los mismos organisms.

### 3.3 Lista de procesos

La misma fila de proceso del Inicio, con filtro por estado (activo / cerrado) y paginación del lado del servidor. Es la única pantalla nueva sin mockup que entra en la demo.

### 3.4 Wizard "Crear proceso" (Etapa 3) — 4 pasos

| Paso | Contiene | Fuera |
| --- | --- | --- |
| 1. Información del rol | Nombre*, Cliente*, Seniority*, Descripción del perfil, Duración de la entrevista (30/45/60/90), Skills (chips) | "Benchmark del rol", chip "Etapa inicial", stepper con doble etiqueta, ID de requisición inventado |
| 2. Referentes | Buscar por nombre/skill, seleccionar (mín. 1), lista de asignados | Tasa de contratación ("64%"), "slots libres", roles Principal/Validador, regla "par técnico", filtros por especialidad |
| 3. Candidatos | Buscar existente → "Agregar"; crear nuevo (Nombre*, Email*, CV); aviso de email duplicado; lista de agregados; **"Sugerir skills desde el CV"** (watsonx.ai, un solo botón) | "92% match", "balance de habilidades", "4.812 perfiles", badges "Watson Enabled" repetidos, LinkedIn |
| 4. Confirmar | Resumen por sección con "Editar", checklist (≥1 referente, ≥1 candidato), **un** botón "Publicar" + "Atrás" | Preview de Slack, Watson Orchestrate, "Estimación de cierre", "políticas IBM", botones "Publicar"/"Guardar" duplicados |

"Guardar como borrador" está disponible en todos los pasos (el estado vive en `wizard.store.ts` hasta publicar).

### 3.5 Detalle de proceso

- **Contiene:**
  - Encabezado con nombre, cliente, seniority y estado.
  - Acciones: **Editar**, **Agregar candidato**, **Generar reporte**.
  - Tabla de candidatos con candidato, etapa, última entrevista, referente y **una** acción contextual según la etapa: Agendar / Ver feedback / Decidir.
  - Columna lateral con referentes asignados y requisitos (stack, expectativas).
- **Fuera:**
  - Embudo con barras y "Tasa de conversión".
  - Banner "Criterio de evaluación actualizado".
  - Animación "ping" de estado activo.
  - Paginación para pocas filas.
  - "Referente de respaldo" y "Benchmark 18 días".
  - "Integración Webex activa".

### 3.6 Feedback técnico (FEED-1)

- **Contiene:**
  - Contexto: proceso, candidato y fecha de la entrevista.
  - **4-5 criterios** con puntaje de 1 a 5 y promedio calculado.
  - Recomendación: Avanzar / En espera / No continuar.
  - Notas.
  - "Guardar borrador" y "Enviar".
- **Fuera:**
  - Análisis del transcript con IA (no existe un transcript).
  - Umbral fijo de aprobación.
  - Texto autogenerado de soft skills y chip pulsante.
- El shell muestra **al referente** que evalúa, no a la reclutadora.

## 4. Tokens canónicos

**Manda el código tal como renderiza hoy.** Este documento explica la intención de cada token; los valores
viven en estos archivos y no se copian aquí:

- `apps/frontend/tailwind.colors.ts`: colores (superficies, primario, texto, estados).
- `apps/frontend/tailwind.config.ts`: tipografía, espaciado, radios y sombras.
- `apps/frontend/src/config/design-tokens.ts`: etapas del proceso y estilos de chip por etapa (uso programático).

| Uso | Dónde está el token | Intención |
| --- | --- | --- |
| Acción primaria | `primary` (`interactive`, `container`) | Un solo botón primario por pantalla; el estado de hover es más oscuro que el reposo, nunca al revés |
| Fondo de la app y de las cards | `surface` (`DEFAULT`, `card`, niveles `low`…`highest`) | La app usa `surface` como lienzo y `surface.card` para cards |
| Separación de cards | borde con `surface` y sombra `raised` | Las cards se separan por borde; la sombra solo en elementos elevados |
| Texto | `text` (`primary`, `secondary`) | Primario para contenido, secundario para ayudas y metadatos |
| Estados (éxito, aviso, peligro, info) | `status` (color y variante `*-bg`) | Badges con fondo tintado y texto del color de estado |
| Radios | `borderRadius` | Más cerrado en chips y badges, más amplio en cards y modales; avatares circulares (`full`) |
| Título de página | `fontSize.headline-md` | Un título por pantalla, en IBM Plex Sans |
| Etapas del proceso | `design-tokens.ts` (`PROCESS_STAGES`, `STAGE_CHIP_STYLES`) | Un color por etapa, definido en un solo sitio |

Reglas: nunca un hex suelto en un componente, y si falta un token se añade al código antes de usarlo. Los
desajustes conocidos entre esta guía y el código están en `good-practices/DEBT_TECH.md` (DT-026).

## 5. Reglas para cualquier pantalla nueva

1. **Una** acción primaria por pantalla.
2. Solo se muestran datos que el sistema realmente tiene. No se muestran métricas aspiracionales ni benchmarks sin histórico.
3. La IA aparece como **una acción explícita** ("Sugerir skills desde el CV"), nunca como badges decorativos repartidos.
4. Cada estado vacío tiene texto y una acción ("Aún no hay procesos — Crear el primero").
5. Las integraciones que no existen (Slack, Webex, Outlook, Orchestrate) no aparecen en la UI hasta existir.

---

## Auditoría de mockups (2026-10-15)

- **Exportaciones rotas:** 8 de 10 `screen.png` eran archivos de 28 bytes (`<FIFE Image failed to fetch>`) y se eliminaron. Solo `iniciar_sesi_n_*` y `dashboard_*_simplificada_2` tienen captura real; el resto se evaluó desde su `code.html`, que se conserva.
- **Dos shells distintos:**
  - **A:** dashboards y paso 1 del wizard.
  - **B:** pasos 3-4, detalle y feedback.
  - Difieren en ítems de navegación, ancho de la sidebar (w-64 / w-60), alto del header y marca. **Unificados en §1.**
- **Datos inconsistentes:**
  - El saludo dice "Mariana" con la usuaria Elena.
  - El ID de requisición cambia entre los pasos del wizard.
  - Los nombres de etapa varían ("Cliente", "Con Cliente", "Cierre").
- **Colores:** el CTA primario es `#0043CE` en unos mockups y `#0F62FE` en otros. **Normalizado en §4.**
- **Pantallas sin diseño:**
  - Listas de Procesos, Entrevistas, Feedback y Reportes.
  - Inicio de referente y de PM.
  - Configuración y notificaciones.
  - Para la demo solo se construye la lista de procesos (§3.3); el resto queda como "Próximamente".
- **El paso 2 del wizard sí existe:** está embebido en la misma página del paso 1 (`crear_nuevo_proceso_*`).

# Best Practices & Convenciones de Calidad

## Architecture Reviewer App

> **Versión:** 1.0.0 · **Stack:** NestJS 10+ / React 18 / TypeScript 5 strict
> **Última revisión:** 2025-07 · **Responsable:** Tech Lead

---

## 1. Introducción

### Propósito

Este documento es la fuente de verdad para todo el equipo humano y para cualquier agente IA colaborando en el proyecto. Define reglas no negociables de arquitectura, estilo y calidad que garantizan que el código pueda escalar, mantenerse y ser comprendido por cualquier colaborador en cualquier momento.

### Filosofía del proyecto

```
Alta cohesión · Bajo acoplamiento · Separación de concerns · Zero side-effects en dominio
```

- **Escalabilidad**: cada capability es un módulo independiente que puede crecer o extraerse
- **Colaboración humano-IA**: el código predecible, corto y single-responsibility es el que mejor interpretan tanto humanos como modelos de lenguaje
- **Hexagonal first**: ninguna capa conoce los detalles de implementación de otra

### Importancia del cumplimiento

> Un archivo que viola los límites de líneas no es un problema de formato. Es evidencia de que una abstracción está faltando.

Incumplir estas reglas activa el proceso de deuda técnica documentado en [`DEBT_TECH.md`](./DEBT_TECH.md).

---

## 2. Frontend — React 18 + TypeScript 5

### 2.1 Atomic Design — Límites estrictos

El proyecto sigue Atomic Design con cuatro niveles. Los límites de líneas son **hard limits**, no recomendaciones.

| Nivel       | Carpeta      | Límite         | Responsabilidad única                            |
| ----------- | ------------ | -------------- | ------------------------------------------------ |
| ⚛️ Atom     | `atoms/`     | **50 líneas**  | Componente visual sin estado de negocio          |
| 🔶 Molecule | `molecules/` | **90 líneas**  | Composición de atoms con funcionalidad acotada   |
| 🔷 Organism | `organisms/` | **100 líneas** | Sección de UI completa, puede tener estado local |
| 📄 Page     | `pages/`     | **90 líneas**  | Composición de organisms + data fetching         |

> **Regla de oro**: si un componente necesita más líneas, le falta una abstracción.

#### ⚛️ Atom — 50 líneas máximo

```typescript
// atoms/StatusPill.tsx  ✅ correcto
interface StatusPillProps {
  readonly status: ScoreStatus;
}
const COLOR: Record<ScoreStatus, string> = { CRITICAL: 'bg-red-100 text-red-700', ... };

export function StatusPill({ status }: StatusPillProps) {
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${COLOR[status]}`}>{status}</span>;
}
```

**✅ Debe**: ser puramente presentacional, recibir datos por props, tener cero llamadas externas
**❌ No debe**: importar hooks de datos, contener lógica de negocio, exceder 2 niveles JSX

#### 🔶 Molecule — 90 líneas máximo

```typescript
// molecules/ScoreBar.tsx  ✅ correcto (18 líneas en producción)
```

**✅ Debe**: componer 2–4 atoms, tener estado UI mínimo (hover, open/close)
**❌ No debe**: llamar a APIs, importar desde `hooks/` de datos, duplicar lógica de otro molecule

#### 🔷 Organism — 100 líneas máximo

```typescript
// organisms/ProjectCard.tsx  ✅ en límite (83 líneas en producción)
```

**✅ Puede**: tener estado local (`useState`), llamar hooks de datos, emitir eventos hacia pages
**❌ No debe**: contener lógica de negocio compleja, múltiples `useEffect`, > 3 hooks de datos

#### 📄 Page — 90 líneas máximo

```typescript
// pages/ArchivedProjectsPage.tsx  ✅ correcto (34 líneas en producción)
```

**✅ Debe**: componer organisms, llamar hooks, manejar routing
**❌ No debe**: contener JSX de más de 2 niveles propios, lógica de transformación de datos

---

### 2.2 Gestión de Estado Global

#### Decisión arquitectónica: **React Query + Estado local**

Para este proyecto **no se adoptará Redux, Context API global ni Zustand**. La justificación:

| Criterio               | Redux RTK  | Context+Reducer | Zustand | **React Query (elegido)** |
| ---------------------- | ---------- | --------------- | ------- | ------------------------- |
| Boilerplate            | Alto       | Medio           | Bajo    | **Mínimo**                |
| Server state           | Manual     | Manual          | Manual  | **Nativo**                |
| Cache & invalidación   | Manual     | Manual          | Manual  | **Automático**            |
| DevTools               | Excelentes | Ninguno         | Básicas | **Excelentes**            |
| Colaboración IA        | Media      | Baja            | Media   | **Alta**                  |
| Adecuación al proyecto | Baja       | Baja            | Media   | **Alta**                  |

**Por qué no Redux**: El 95% del estado de este proyecto _es estado del servidor_ (projects, scans, reports). Redux está diseñado para estado de cliente. Añadir Redux crearía una segunda fuente de verdad duplicando los datos del servidor.

**Por qué no Zustand**: Apropiado si hubiera estado de UI global complejo (wizards multi-paso, selecciones persistentes cross-page). Actualmente no existe ese caso.

**Por qué React Query**: Ya está instalado (`@tanstack/react-query`). Maneja cache, invalidación, polling y estados de loading/error de forma declarativa. El patrón actual del proyecto es correcto y debe mantenerse.

**React Query es el único store — la analogía con Redux**: React Query hace de "single source of
truth" para todo el estado de servidor exactamente como lo haría un único store de Redux, pero
sin `reducer` — la caché de la query *es* el store, y el hook que la expone (`useProjects`,
`useScanStatus`, …) hace de "action creator + selector" combinados. Por eso copiar un resultado
de `useQuery` a un `useState` local no es solo redundante: crea una **segunda fuente de verdad**
del mismo dato, y esa duplicación es la causa típica de condiciones de carrera de UI (la copia en
`useState` y la caché de React Query se desincronizan tras una invalidación, un refetch en curso,
o una mutación optimista). La regla no es "React Query es más cómodo" — es "solo puede existir
una copia de cada dato de servidor en memoria del cliente".

#### Patrón correcto: un hook por entidad de dominio

```typescript
// hooks/useProjects.ts — ✅ patrón vigente
export function useProjects() {
  return useQuery<ProjectResponse[]>({
    queryKey: ['projects'],
    queryFn: projectsApi.findAll,
  });
}

// hooks/useArchiveProject.ts — ✅ mutación con invalidación
export function useArchiveProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: projectsArchivedApi.archive,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}
```

**Anti-patterns a evitar**:

```typescript
// ❌ Estado derivado en useState — usar useMemo o derivar directo del query
const [filtered, setFiltered] = useState(projects); // MAL

// ✅ Derivar directo
const filtered = projects.filter((p) => p.name.includes(search));

// ❌ Llamar la API en useEffect
useEffect(() => {
  fetch('/api/projects').then(setProjects);
}, []); // MAL

// ✅ Siempre React Query
const { data } = useProjects();
```

---

### 2.3 Convenciones de Código Frontend

#### Nombres de archivo

| Tipo             | Convención                      | Ejemplo               |
| ---------------- | ------------------------------- | --------------------- |
| Componente       | PascalCase                      | `ProjectCard.tsx`     |
| Hook             | camelCase + prefijo `use`       | `useProjectScans.ts`  |
| Util puro        | camelCase                       | `dateFormatter.ts`    |
| Constantes       | UPPER_SNAKE_CASE                | `DIMENSION_LABELS.ts` |
| Tipos/Interfaces | PascalCase + sufijo `.types.ts` | `Report.types.ts`     |

#### Orden de imports

```typescript
// 1. React core
import { useState, useCallback } from 'react';

// 2. Third-party (router, query, librerías)
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

// 3. Contratos compartidos (workspace)
import type { ProjectResponse } from '@repo/contracts';

// 4. Internos — templates > organisms > molecules > atoms > hooks > lib
import { DashboardLayout } from '../templates/DashboardLayout';
import { Button } from '../atoms/Button';
import { useProjects } from '../hooks/useProjects';
import { projectsApi } from '../lib/api-client';
```

#### TypeScript

- `interface` para objetos y props públicas de componentes
- `type` para uniones, aliases e intersecciones
- **Cero `any`** — usar `unknown` + type guard o `Record<string, unknown>`
- Props siempre con `readonly` en las interfaces
- `as const` para objetos de configuración

```typescript
// ✅ correcto
interface ProjectCardProps {
  readonly project: ProjectResponse;
  readonly onScan: (project: ProjectResponse) => void;
}

// ❌ incorrecto
interface ProjectCardProps {
  project: any;
  onScan: Function;
}
```

#### Performance

- `useCallback` solo cuando la función se pasa como prop a un componente memoizado
- `useMemo` solo para cálculos > O(n²) o arrays derivados costosos — **no para todo**
- `React.memo` solo con evidencia de re-renders innecesarios (React DevTools Profiler)
- Lazy loading obligatorio para páginas nuevas que excedan 50KB de bundle

---

### 2.3.5 Capa de infraestructura — consumo de servicios externos

Los hooks de dominio (`hooks/use*.ts`) **no deben llamar `apiClient`/`axios` directamente**.
Entre el hook y el cliente HTTP va una capa `infrastructure/` — un archivo por capability
(`infrastructure/scans.infrastructure.ts`, `infrastructure/projects.infrastructure.ts`…) con
funciones puras `async` que reciben parámetros tipados y devuelven datos tipados, sin lógica de
UI ni de cache. Es el equivalente frontend del `infrastructure/adapters/` del backend: la única
capa consciente de los detalles de transporte (HTTP, headers, rutas).

```typescript
// infrastructure/scans.infrastructure.ts — ✅ una función por operación, sin estado
export async function fetchScanById(id: string): Promise<ScanResponse> {
  return apiClient.get<ScanResponse>(`/scans/${id}`).then((r) => r.data);
}

// hooks/useScanStatus.ts — ✅ el hook orquesta la query, no conoce axios
export function useScanStatus(scanId: string) {
  return useQuery<ScanResponse>({
    queryKey: ['scan', scanId],
    queryFn: () => fetchScanById(scanId),
    refetchInterval: (query) => (isTerminal(query.state.data) ? false : POLLING_INTERVAL_MS),
  });
}
```

**Equivalencia con el flujo Redux que describe el equipo** (efecto → action → servicio →
reducer → store → UI): aquí el "efecto que dispara la action" es el hook llamando `useQuery`, el
"servicio que hace el fetch" es la función en `infrastructure/`, y el "reducer que actualiza el
store" no existe como código propio porque **React Query ya lo implementa internamente** — su
caché por `queryKey` cumple el rol de store, y sus estados (`isLoading`/`isError`/`data`/`isFetching`)
son exactamente las etapas (éxito, error, intermitencia) que el store debería reflejar. Añadir un
reducer/store propio por encima duplicaría ese trabajo.

**✅ Debe**: exponer funciones nombradas por operación (`fetchX`, `createX`, `archiveX`), tipos de
entrada/salida explícitos, cero JSX, cero hooks.
**❌ No debe**: importar `useQuery`/`useState`, transformar datos para la UI (eso es del hook o de
`services/`), acumular lógica condicional de negocio.

---

## 2.4 Estilo de código transversal (frontend + backend)

Estas reglas aplican a todo el TypeScript del proyecto, independientemente
de la capa. Están pensadas para que el código sea **predecible, testeable
y auditable** — tanto por humanos como por agentes IA.

### 2.4.1 Declarativo sobre imperativo

Preferir **operadores inmutables** (`.map`, `.filter`, `.reduce`, `.flatMap`,
`.some`, `.every`, `.find`, spread/rest, destructuring) sobre bucles
imperativos con mutación (`for`, `while`, `push`, `pop`, `splice`,
reasignación).

**Por qué:** el código declarativo expresa **qué** se quiere obtener sin
describir **cómo**, elimina toda una clase de bugs (índices fuera de rango,
mutación compartida, orden de iteración), y encaja mucho mejor con la
inmutabilidad que React Query y Redux-style stores asumen.

```typescript
// ✅ Declarativo — se lee como una descripción del resultado
const activeProjectsDto = projects.filter((p) => p.visible).map(toDto);

const totalImpact = findings.reduce((sum, f) => sum + f.impact, 0);

const dimensionsByKey = Object.fromEntries(dimensions.map((d) => [d.key, d]));

// ❌ Imperativo con mutación — evita
const activeProjectsDto = [];
for (const p of projects) {
  if (p.visible) activeProjectsDto.push(toDto(p));
}

let totalImpact = 0;
for (let i = 0; i < findings.length; i++) {
  totalImpact += findings[i].impact;
}
```

**Excepciones justificadas** (raras, deben quedar comentadas):

- Hot paths **medidos** con perfil, donde el overhead de las funciones de
  callback es demostradamente el cuello de botella.
- Streams asíncronos donde `for await ... of` es la primitiva natural.
- Interop con APIs externas que exigen mutabilidad (raro; casi siempre se
  puede encapsular la mutación dentro de una función pura que retorne el
  nuevo valor).

**Regla operativa:**

- `let` requiere justificación (¿por qué esto no puede ser `const`?).
- Reasignar parámetros de función está prohibido (`no-param-reassign`).
- Preferir `readonly` en propiedades de interfaces y `ReadonlyArray<T>` /
  `Readonly<T>` cuando el contrato es "no vas a mutar esto".

### 2.4.2 Single Responsibility Principle (SRP)

Cada archivo, clase, función y hook debe tener **una sola razón para
cambiar**.

**Por qué:** los archivos con múltiples responsabilidades son la causa raíz
del 90% de las violaciones de límite de líneas de este proyecto. Los
límites por tipo de archivo (atoms ≤ 50, services ≤ 80, adapters ≤ 100…)
son un **guardrail proxy de SRP**: si un archivo pide "una excepción por
complejidad legítima", casi siempre son 2+ responsabilidades escondidas
que se pueden extraer.

**Test de SRP en una frase:**

> ¿Puedes describir la responsabilidad del archivo/clase/función **sin
> usar la palabra "y"**?

Si necesitas "y", hay más de una responsabilidad — extrae.

```typescript
// ❌ Múltiples responsabilidades — "valida, transforma, persiste Y notifica"
class ReportService {
  async importReport(payload: unknown) {
    // 1. validación
    const dto = plainToInstance(ImportReportDto, payload);
    await validateOrReject(dto);
    // 2. transformación de dominio
    const scan = mapDtoToScan(dto);
    scan.findings = enrichWithSeverity(scan.findings);
    // 3. persistencia
    await this.prisma.scan.create({ data: scan });
    // 4. notificación
    await this.mailer.send(scan.projectOwner, 'Report imported');
  }
}

// ✅ Un servicio orquesta, cada dependencia tiene UNA responsabilidad
class ReportImportService {
  constructor(
    private readonly validator: ReportValidator,
    private readonly mapper: ReportMapper,
    private readonly scanRepo: ScanRepositoryPort,
    private readonly notifier: NotificationPort,
  ) {}

  async import(payload: unknown): Promise<ScanId> {
    const dto = await this.validator.validate(payload);
    const scan = this.mapper.toDomain(dto);
    const saved = await this.scanRepo.save(scan);
    await this.notifier.notifyOwner(saved);
    return saved.id;
  }
}
```

**Señales de violación (romper en piezas):**

- Un service que valida + transforma + persiste + notifica → 4 responsabilidades
- Un hook que fetchea + transforma + expone acciones no relacionadas
- Un componente que renderiza UI + orquesta lógica de negocio + gestiona estado global
- Un archivo que exporta N clases/funciones no relacionadas entre sí

**Aplicación práctica:**

- Cuando un archivo se acerca al 80% de su límite de líneas, **detenerse
  y preguntar**: ¿esto es SRP o son múltiples responsabilidades?
- Extraer antes de ampliar. Un archivo pequeño y enfocado > un archivo
  grande con "todo lo relacionado".
- La duplicación aparente (dos funciones parecidas en archivos distintos)
  no es siempre mala: puede ser SRP legítimo si las razones para cambiar
  son distintas.

---

## 3. Backend — NestJS 10 + TypeScript 5

### 3.1 Arquitectura Hexagonal — estructura de carpetas

```
src/
├── capabilities/           # Un directorio por bounded context
│   └── <capability>/
│       ├── application/
│       │   ├── ports/      # Interfaces abstractas (contratos)
│       │   └── services/   # Casos de uso, orquestación
│       ├── domain/
│       │   ├── dto/        # Validación con class-validator
│       │   └── interfaces/ # Entidades, value objects (cero deps externas)
│       └── infrastructure/
│           ├── adapters/   # Implementa ports (DB, HTTP, cola)
│           └── controllers/# Entry point HTTP, thin layer
├── shared/                 # Guards, interceptors, filtros cross-cutting
└── main.ts
```

#### Reglas de dependencia — inviolables

```
Controller → Service → Port (abstracto)
                          ↑
                       Adapter (implementa Port, conoce Prisma/Redis/HTTP)

Domain → CERO dependencias externas (ni NestJS, ni Prisma)
```

**Ejemplo de violación detectada en el proyecto** (documentada en DEBT_TECH.md):

```typescript
// ❌ VIOLATION — el Mapper en domain usa @Injectable() de NestJS
// src/billing/domain/mapper/billing-response.mapper.ts
import { Injectable } from '@nestjs/common'; // FORBIDDEN en domain/
```

### 3.2 Límites de líneas por tipo de archivo

| Tipo                     | Límite         | Archivo ejemplo                        |
| ------------------------ | -------------- | -------------------------------------- |
| Controller               | **55 líneas**  | `project.controller.ts` (50 líneas ✅) |
| Service (application)    | **80 líneas**  | `project.service.ts` (42 líneas ✅)    |
| Port (abstracto)         | **50 líneas**  | `project.port.ts` (15 líneas ✅)       |
| Adapter (infrastructure) | **100 líneas** | `project.adapter.ts` (69 líneas ✅)    |
| DTO                      | **45 líneas**  | `create-project.dto.ts` (17 líneas ✅) |
| Module                   | **60 líneas**  | `projects.module.ts` (21 líneas ✅)    |
| Worker / Processor       | **100 líneas** | `analysis.worker.ts` (125 líneas ⚠️)   |

### 3.3 Principios SOLID aplicados

#### S — Single Responsibility

Cada clase tiene una sola razón de cambio. El test: ¿se puede describir la responsabilidad de la clase en una frase sin usar "y"?

```typescript
// ✅ SRP: ProjectAdapter → "persiste y recupera proyectos de SQLite"
// ✅ SRP: ReportImportService → "orquesta la importación de un ReportOutput a BD"
// ❌ SRP: BillingService (704 líneas) → "orquesta llamadas + mapea + evalúa semáforo + consolida"
```

#### O — Open/Closed

Nuevos proveedores AI se agregan sin modificar `ScanService`:

```typescript
// scans.module.ts — extensión sin modificación ✅
const AI_PROVIDER_MAP: Record<AiProviderKey, new () => AiProviderPort> = {
  bob: BobProvider,
  ica: IcaProvider,
  openai: OpenAiProvider,
  // nuevo: MiNuevoProvider ← solo agregar aquí
};
```

#### D — Dependency Inversion

```typescript
// ✅ Service depende del port abstracto, no del adaptador concreto
constructor(private readonly projectPort: ProjectPort) {} // abstracto

// ❌ incorrecto
constructor(private readonly projectAdapter: ProjectAdapter) {} // concreto
```

### 3.4 Convenciones de Código Backend

#### Nombres de archivo (kebab-case siempre)

| Tipo             | Sufijo           | Ejemplo                           |
| ---------------- | ---------------- | --------------------------------- |
| Controller       | `.controller.ts` | `report-import.controller.ts`     |
| Service          | `.service.ts`    | `report-import.service.ts`        |
| Port (abstracto) | `.port.ts`       | `report-import.port.ts`           |
| Adapter          | `.adapter.ts`    | `report-import-prisma.adapter.ts` |
| DTO              | `.dto.ts`        | `import-report.dto.ts`            |
| Module           | `.module.ts`     | `reports.module.ts`               |

#### Error handling

```typescript
// ✅ Excepción de dominio con contexto
throw new NotFoundException(`Project ${id} not found`);

// ✅ Try/catch con log + re-throw transformado
try {
  // ...
} catch (error) {
  this.logger.error('Failed to import report', error);
  throw new InternalServerErrorException('Failed to import report into database');
}

// ❌ Catch silencioso
try { ... } catch {} // NEVER
```

#### Logging

```typescript
private readonly logger = new Logger(ReportImportService.name);

this.logger.log(`Report imported: scanId=${scan.id} project="${name}"`); // INFO — estado de negocio
this.logger.warn(`Validation failed: ${details}`);                        // WARN — input inválido
this.logger.error('Failed to import report', error);                      // ERROR — fallo técnico

// ❌ Nunca loguear PII
this.logger.log(JSON.stringify(fullRequestBody)); // FORBIDDEN — puede contener RUT, rentas
```

### 3.5 Controllers — composición, no lógica

Un controller **solo** debe: recibir la request, llamar un único método de un service, y dar
forma a la response HTTP (código de estado, DTO de salida). Cualquier otra cosa — auth,
logging, validación, mapeo de errores, rate limiting, transformación de payload — se resuelve
por **composición** con Guards, Interceptors, Filters o Pipes, aplicados por endpoint o por
controller completo vía decorador, nunca escritos inline en el handler.

```typescript
// ✅ el controller no sabe cómo se loguea, valida o mapean errores — solo delega
@Controller('scans')
@UseInterceptors(HttpLoggingInterceptor) // cross-cutting, fuera del handler
export class ScansController {
  constructor(private readonly scanService: ScanService) {}

  @Post()
  create(@Body() dto: CreateScanDto): Promise<ScanResponse> {
    return this.scanService.create(dto);
  }
}

// ❌ lógica de negocio/validación/logging inline en el controller
@Post()
async create(@Body() body: unknown) {
  if (!body || typeof body !== 'object') throw new BadRequestException('bad body'); // ← a un Pipe
  this.logger.log(`creating scan: ${JSON.stringify(body)}`); // ← a un Interceptor
  // ...
}
```

El proyecto ya tiene el ejemplo de referencia para esto: `HttpLoggingInterceptor`
(`apps/api/src/shared/interceptors/http-logging.interceptor.ts`) mueve todo el logging de
request/response fuera de cada controller hacia una sola pieza reutilizable en `shared/`. Cada
nueva necesidad transversal (auth, rate limit, cache de respuesta) sigue el mismo patrón: una
pieza en `shared/`, aplicada por decorador, cero copias del mismo código en distintos
controllers.

### 3.6 Convenciones REST

- **Recursos en plural**: `/scans`, `/projects`, nunca `/scan` o verbos en la URL (`/getScans`).
- **Verbos HTTP con su semántica estándar**: `GET` (lectura, sin side-effects) para listar/leer
  un recurso, `POST` para crear, `PATCH` para actualización parcial (`PATCH /projects/:id/archive`),
  `DELETE` para eliminar (o soft-delete, como en `projects`). Evitar `PUT` salvo reemplazo
  completo del recurso.
- **Códigos de estado con significado**: `200` lectura ok, `201` creación ok, `204` sin contenido
  (delete/acciones sin body de respuesta), `400` input inválido, `404` recurso no encontrado,
  `409` conflicto de estado (p. ej. archivar un proyecto ya archivado).
- **Filtrado vía query params**, no vía rutas anidadas más de un nivel:
  `GET /scans?projectId=xyz` ✅, no `GET /projects/xyz/scans/all/detailed` ❌.
- **Anidación de recursos máx. 1 nivel** (`/projects/:id/restore` está bien porque es una acción
  sobre el recurso, no una colección anidada de otra colección).

---

## 4. Contratos Compartidos — `packages/contracts`

- Solo tipos e interfaces, **cero lógica de runtime** (excepción: `toScoreStatus` es una utilidad pura)
- Cualquier cambio en contracts requiere `npm run build` en el package antes de compilar el API
- Frontend y Backend importan del **mismo contrato**: `@repo/contracts`
- Agregar un campo a una interfaz = agregar en contracts + rebuild + actualizar adapter + actualizar toDto

---

## 5. Checklist de PR

Antes de hacer merge, verificar:

```
ARQUITECTURA
[ ] Ningún archivo excede su límite de líneas (o tiene etiqueta DEBT_TECH)
[ ] Domain no importa NestJS ni Prisma
[ ] Controllers solo llaman Services, no Adapters directamente
[ ] Services solo llaman Ports, no Adapters directamente
[ ] Nuevos endpoints registrados en el módulo correspondiente

TYPESCRIPT
[ ] cero uses de `any`
[ ] Todas las props con tipos explícitos
[ ] tsc --noEmit sin errores en api y web

FRONTEND
[ ] Componentes dentro del límite Atomic Design
[ ] Datos del servidor gestionados por React Query
[ ] Sin `useEffect` para fetching de datos

BACKEND
[ ] DTO con class-validator decorators
[ ] Puerto abstracto definido antes del adapter
[ ] Error handling con logger + excepción tipada

CONTRATOS
[ ] Si se modificó packages/contracts → rebuild ejecutado
[ ] Cambios backward-compatible o versión incrementada
```

---

## 6. Changelog y versionado — Changesets

El proyecto usa [Changesets](https://github.com/changesets/changesets) en modo **fixed** (los 4 packages del monorepo avanzan siempre con la misma versión, ya que es un solo producto deployado, no librerías independientes que se publiquen por separado).

Flujo:

1. Al abrir un PR con un cambio relevante para el changelog, correr `pnpm changeset` — elige los packages afectados, el tipo de bump (`patch`/`minor`/`major`) y escribe una descripción corta. Eso genera un archivo en `.changeset/`.
2. Mergear el PR normalmente (el changeset queda commiteado junto con el resto del diff).
3. El workflow `.github/workflows/release.yml` abre/actualiza automáticamente un PR llamado **"Version Packages"** en `main`, acumulando todos los changesets pendientes.
4. Al mergear ese PR de versión, se actualizan `CHANGELOG.md` y la versión en los 4 `package.json` — no hace falta redactar el resumen de cambios a mano.

No se publica a ningún registry (todos los packages son `"private": true`); Changesets se usa únicamente para versión + changelog interno.

---

_Ver también: [`DEBT_TECH.md`](./DEBT_TECH.md) · [`METRICS.md`](./METRICS.md)_

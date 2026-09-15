# Best Practices & Convenciones de Calidad

## IBM Talent Bridge

> **Versión:** 1.1.0 · **Stack:** NestJS 10+ / React 18 / TypeScript 5 strict
> **Última revisión:** 2025 · **Responsable:** Tech Lead
> **Basado en:** `architecture-reviewer-app` good-practices — adaptado a Feature Slices

---

## 1. Introducción

### Propósito

Este documento es la fuente de verdad para todo el equipo humano y para cualquier agente IA
colaborando en el proyecto. Define reglas no negociables de arquitectura, estilo y calidad.

### Filosofía del proyecto

```
Alta cohesión · Bajo acoplamiento · Separación de concerns · Zero side-effects en dominio
```

- **Feature Slices**: cada dominio de negocio es un slice vertical autocontenido
- **Atomic Design dentro del slice**: los componentes de cada feature siguen la jerarquía
  atom → molecule → organism → page, con límites de líneas estrictos
- **Shared transversal**: lo que es reutilizable entre features vive en `shared/` con
  la misma jerarquía atomic — nunca se duplica entre features
- **Hexagonal first en backend**: ninguna capa conoce los detalles de implementación de otra

### Importancia del cumplimiento

> Un archivo que viola los límites de líneas no es un problema de formato.
> Es evidencia de que una abstracción está faltando.

---

## 2. Frontend — React 18 + TypeScript 5

### 2.1 Estructura de carpetas — Feature Slices + Atomic Design

Cada dominio de negocio tiene su propio slice en `src/features/<nombre>/`.
Los componentes del slice siguen Atomic Design **dentro** de `components/`.
Los elementos transversales van en `src/shared/` con la misma jerarquía.

```
src/
├── features/
│   └── <feature>/                  # Un slice por dominio (auth, processes, interviews…)
│       ├── components/
│       │   ├── atoms/              # Elementos visuales puros, sin estado de negocio
│       │   ├── molecules/          # Composición de atoms con funcionalidad acotada
│       │   ├── organisms/          # Sección completa, puede tener estado local
│       │   └── pages/              # Composición de organisms + data fetching
│       ├── hooks/                  # Un hook por entidad/operación de dominio
│       ├── infrastructure/         # Funciones HTTP puras (sin hooks, sin JSX)
│       └── types/                  # Tipos locales que extienden shared-types
│
├── shared/
│   ├── components/
│   │   ├── atoms/                  # Button, InputField, StageChip, Avatar…
│   │   ├── molecules/              # SearchBar, StatusBadge, AvatarGroup…
│   │   └── organisms/              # AppLayout, SidebarNav, DataTable…
│   ├── hooks/                      # useDebounce, usePagination, useLocalStorage…
│   └── utils/                      # Formatters, validators, helpers puros
│
├── router/                         # Definición de rutas + guards por rol
├── config/                         # Constantes, variables de entorno tipadas
└── main.tsx
```

**Regla de decisión — ¿feature o shared?**
- Si el componente/hook solo tiene sentido en UN feature → va en `features/<nombre>/`
- Si aparece en 2+ features sin modificación → va en `shared/`
- Si aparece en 2+ features con pequeñas variaciones → atom en `shared/`, organism en cada feature

### 2.2 Atomic Design — Límites estrictos

Los límites de líneas son **hard limits**, no recomendaciones.
Aplican tanto en `features/<nombre>/components/` como en `shared/components/`.

| Nivel       | Carpeta      | Límite         | Responsabilidad única                            |
| ----------- | ------------ | -------------- | ------------------------------------------------ |
| ⚛️ Atom     | `atoms/`     | **50 líneas**  | Componente visual sin estado de negocio          |
| 🔶 Molecule | `molecules/` | **90 líneas**  | Composición de atoms con funcionalidad acotada   |
| 🔷 Organism | `organisms/` | **100 líneas** | Sección de UI completa, puede tener estado local |
| 📄 Page     | `pages/`     | **90 líneas**  | Composición de organisms + data fetching         |

> **Regla de oro**: si un componente necesita más líneas, le falta una abstracción.

#### ⚛️ Atom — 50 líneas máximo

```typescript
// features/processes/components/atoms/StageChip.tsx  ✅
import { STAGE_CHIP_COLORS } from '@ibm-talent-bridge/shared-utils';
import type { ProcessStage } from '@ibm-talent-bridge/shared-types';

interface IStageChipProps {
  readonly stage: ProcessStage;
}

export function StageChip({ stage }: IStageChipProps) {
  const { bg, text } = STAGE_CHIP_COLORS[stage];
  return (
    <span style={{ backgroundColor: bg, color: text }}
          className="px-2 py-0.5 rounded text-[11px] font-medium leading-none">
      {STAGE_LABELS[stage]}
    </span>
  );
}
```

**✅ Debe**: ser puramente presentacional, recibir datos por props, cero llamadas externas
**❌ No debe**: importar hooks de datos, contener lógica de negocio, exceder 2 niveles JSX

#### 🔶 Molecule — 90 líneas máximo

**✅ Debe**: componer 2–4 atoms, tener estado UI mínimo (hover, open/close, toggle)
**❌ No debe**: llamar APIs, importar hooks de datos, duplicar lógica de otro molecule

#### 🔷 Organism — 100 líneas máximo

**✅ Puede**: tener estado local (`useState`), usar hooks de datos, emitir eventos hacia pages
**❌ No debe**: lógica de negocio compleja, múltiples `useEffect`, más de 3 hooks de datos

#### 📄 Page — 90 líneas máximo

**✅ Debe**: componer organisms, llamar hooks, manejar routing y parámetros de URL
**❌ No debe**: JSX de más de 2 niveles propios, lógica de transformación de datos

---

### 2.3 Gestión de Estado — una sola fuente de verdad, dos dominios distintos

**React Query y Zustand no son dos stores del mismo tipo.** Gestionan dominios
que no se solapan, lo que sí cumple el principio de fuente única de verdad.

Usar Zustand solo obligaría a reimplementar a mano el cache, la deduplicación
de requests, la invalidación post-mutación y el refresco automático — es decir,
Redux + Thunks con más boilerplate. Usar React Query solo forzaría a modelar
estado de cliente (token JWT, wizard) como si fuera una query HTTP, que es
semánticamente incorrecto y confuso.

| Dominio             | Herramienta     | Por qué no el otro                                     |
| ------------------- | --------------- | ------------------------------------------------------ |
| Estado del servidor | **React Query** | Cache, invalidación, dedup y refresco son automáticos  |
| Estado del cliente  | **Zustand**     | Datos que el cliente genera — nunca vienen de un GET   |

**Zustand** gestiona únicamente:
- Token JWT + rol + perfil del usuario autenticado (resultado del POST /auth/login)
- Paso activo del wizard multi-paso (estado UI antes de hacer el POST final)
- Preferencias de UI (sidebar colapsado, tema)

**React Query** gestiona todo lo demás:
- Cualquier dato que venga de un GET HTTP
- Mutaciones POST/PATCH/DELETE con invalidación automática del cache

**Regla de no solapamiento — inviolable:**
> El mismo dato **nunca** existe en los dos stores simultáneamente.
> Si viene de un GET → React Query. Si el cliente lo genera → Zustand.

```typescript
// ✅ Estado de servidor → React Query
const { data: processes } = useProcesses();

// ✅ Token del login → Zustand (el cliente lo generó en POST /auth/login)
const { token, role } = useAuthStore();

// ❌ Copiar datos del servidor a useState — viola la fuente única
const [processes, setProcesses] = useState([]); // MAL

// ❌ Guardar datos del servidor en Zustand — MAL
authStore.setProcesses(data); // MAL — eso es de React Query
```

#### Zustand: stores pequeños por dominio — no un store global

```typescript
// features/auth/store/auth.store.ts ✅ — máx 50 líneas
interface IAuthState {
  readonly token: string | null;
  readonly role: UserRole | null;
  readonly user: User | null;
  readonly setAuth: (token: string, role: UserRole, user: User) => void;
  readonly logout: () => void;
}

export const useAuthStore = create<IAuthState>((set) => ({
  token: null,
  role: null,
  user: null,
  setAuth: (token, role, user) => set({ token, role, user }),
  logout: () => set({ token: null, role: null, user: null }),
}));

// features/processes/store/wizard.store.ts ✅ — estado del wizard antes del POST
export const useWizardStore = create<WizardState>((set) => ({
  step: 1,
  roleInfo: null,
  referents: [],
  nextStep: () => set((s) => ({ ...s, step: s.step + 1 })),
  setRoleInfo: (data) => set((s) => ({ ...s, roleInfo: data })),
  reset: () => set({ step: 1, roleInfo: null, referents: [] }),
}));
```

No necesita `Provider` — se importa el hook directamente donde se necesita.

#### Flujo de datos — quién puede hablar con los stores

El **organism** es el límite de la capa de datos. Todo lo que está por debajo
recibe exclusivamente props. Ninguna molecule ni atom accede a stores directamente.

```
Page
 └── customHook de page (routing, animaciones, orquestación)
      └── Organism ←── customHook del feature (ÚNICO punto que toca stores)
           ├── useProcesses()     ← React Query
           ├── useAuthStore()     ← Zustand
           └── deriva lógica → pasa por props hacia abajo
                └── Molecule     (solo props — nunca useQuery ni useStore)
                     └── Atom    (solo props — puramente visual)
```

```typescript
// organisms/ProcessList.tsx ✅ — el organism orquesta todo
export function ProcessList() {
  const { data: processes, isLoading } = useProcesses(); // React Query
  const { role } = useAuthStore();                       // Zustand
  const [search, setSearch] = useState('');              // estado UI local

  const visible = useMemo(
    () => processes?.filter((p) => p.title.includes(search)) ?? [],
    [processes, search],
  );

  return <ProcessListView items={visible} role={role} onSearch={setSearch} />;
  // ProcessListView es molecule — recibe props, no sabe que existen stores
}

// molecules/ProcessListView.tsx ✅ — solo props
interface IProcessListViewProps {
  readonly items: ProcessResponse[];
  readonly role: UserRole;
  readonly onSearch: (q: string) => void;
}
// ❌ NUNCA esto en una molecule:
// const { data } = useProcesses();    // MAL
// const { role } = useAuthStore();    // MAL
```

#### Patrón correcto: un hook por operación de dominio

```typescript
// features/processes/hooks/useProcesses.ts ✅
export function useProcesses() {
  return useQuery<ProcessResponse[]>({
    queryKey: ['processes'],
    queryFn: processesInfrastructure.findAll,
  });
}

// features/processes/hooks/useCreateProcess.ts ✅
export function useCreateProcess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: processesInfrastructure.create,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['processes'] }),
  });
}
```

**Anti-patterns prohibidos:**
```typescript
// ❌ Estado derivado en useState — derivar con useMemo o inline
const [filtered, setFiltered] = useState(processes); // MAL

// ✅ Derivar con useMemo
const filtered = useMemo(
  () => processes?.filter((p) => p.title.includes(search)) ?? [],
  [processes, search],
);

// ❌ Llamar la API en useEffect
useEffect(() => { fetch('/api/processes').then(setData); }, []); // MAL

// ✅ Siempre React Query
const { data } = useProcesses();

// ❌ Molecule o Atom llamando al store directamente
// En molecules/SomeCard.tsx:
const { role } = useAuthStore(); // MAL — esto rompe el flujo de props

// ✅ El organism pasa el rol como prop
<SomeCard role={role} ... />
```

---

### 2.4 Capa de infraestructura frontend

Los hooks **no llaman axios/fetch directamente**. Entre el hook y el cliente HTTP
va `infrastructure/<feature>.infrastructure.ts` — funciones `async` puras, tipadas,
sin lógica de UI ni de cache.

```typescript
// features/processes/infrastructure/processes.infrastructure.ts ✅
export async function findAllProcesses(): Promise<ProcessResponse[]> {
  return apiClient.get<ProcessResponse[]>('/processes').then((r) => r.data);
}

export async function createProcess(dto: CreateProcessRequest): Promise<ProcessResponse> {
  return apiClient.post<ProcessResponse>('/processes', dto).then((r) => r.data);
}
```

**✅ Debe**: exponer funciones nombradas por operación (`findAll`, `create`, `findById`)
**❌ No debe**: importar `useQuery`/`useState`, transformar datos para la UI, acumular lógica condicional

#### Patrón mock-first (mientras el backend de la feature no existe)

Si el endpoint real todavía no está construido, la función de `infrastructure/`
se implementa igual — pero resuelve con un mock/fixture en vez de `apiClient`:

```typescript
// features/candidates/infrastructure/candidates.infrastructure.ts ✅
const MOCK_CANDIDATES: CandidateResponse[] = [ /* ... */ ];

export async function findAllCandidates(): Promise<CandidateResponse[]> {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_CANDIDATES), 400));
}
```

El hook (`useCandidatesQuery`) y el organism que lo consume no cambian cuando
el backend exista — solo se reemplaza el cuerpo de esta función por la llamada
real a `apiClient`. Por eso ningún dato "que algún día vendrá de un GET" debe
vivir como constante `MOCK_*` dentro de una page o componente: siempre en
`infrastructure/`. Ver `good-practices/examples/frontend/infrastructure.example.ts`
y `hook.example.ts`.

---

### 2.5 Límites de líneas frontend (resumen)

| Tipo               | Límite        | Ubicación                                  |
| ------------------ | ------------- | ------------------------------------------ |
| Atom               | **50 líneas** | `components/atoms/`                        |
| Molecule           | **90 líneas** | `components/molecules/`                    |
| Organism           | **100 líneas**| `components/organisms/`                    |
| Page               | **90 líneas** | `components/pages/`                        |
| Hook               | **60 líneas** | `hooks/`                                   |
| Infrastructure fn  | **50 líneas** | `infrastructure/`                          |
| Store (Zustand)    | **50 líneas** | `features/auth/store/` o `shared/`         |

---

### 2.6 Convenciones de Código Frontend

#### Nombres de archivo

| Tipo              | Convención                       | Ejemplo                      |
| ----------------- | -------------------------------- | ---------------------------- |
| Componente        | PascalCase                       | `StageChip.tsx`              |
| Hook              | camelCase + prefijo `use`        | `useProcesses.ts`            |
| Infrastructure    | camelCase + sufijo `.infra.ts`   | `processes.infra.ts`         |
| Store Zustand     | camelCase + sufijo `.store.ts`   | `auth.store.ts`              |
| Tipos locales     | PascalCase + sufijo `.types.ts`  | `Process.types.ts`           |
| Constantes        | UPPER_SNAKE_CASE                 | `STAGE_LABELS.ts`            |

#### Orden de imports

```typescript
// 1. React core
import { useState, useMemo } from 'react';

// 2. Third-party
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

// 3. Packages del workspace
import type { ProcessResponse } from '@ibm-talent-bridge/shared-types';
import { formatStageLabel } from '@ibm-talent-bridge/shared-utils';

// 4. Shared interno (organisms → molecules → atoms → hooks → utils)
import { AppLayout } from '@/shared/components/organisms/AppLayout';
import { Button } from '@/shared/components/atoms/Button';

// 5. Del feature actual (organisms → molecules → atoms → hooks → infra)
import { ProcessListItem } from '../molecules/ProcessListItem';
import { useProcesses } from '../hooks/useProcesses';
```

#### TypeScript

- `interface` para props y objetos de dominio, prefijo `I` (ver §2.7 "Nomenclatura de tipos")
- `type` para uniones, aliases e intersecciones, prefijo `T`
- `enum` para conjuntos fijos de valores, prefijo `E`
- **Cero `any`** — usar `unknown` + type guard o generics
- Props siempre con `readonly`
- `as const` para objetos de configuración y mapas de colores/labels

---

## 2.7 Estilo de código transversal (frontend + backend)

### Declarativo sobre imperativo

```typescript
// ✅ Declarativo
const active = processes.filter((p) => p.status === 'active').map(toDto);

// ❌ Imperativo con mutación
const active = [];
for (const p of processes) {
  if (p.status === 'active') active.push(toDto(p));
}
```

- `let` requiere justificación — preferir `const` siempre
- Reasignar parámetros de función: prohibido
- `readonly` en propiedades de interfaces cuando el contrato es inmutable

### Single Responsibility Principle

> ¿Puedes describir la responsabilidad del archivo en **una frase sin usar "y"**?
> Si necesitas "y", hay más de una responsabilidad — extrae.

Señales de violación: un hook que fetchea + transforma + gestiona estado global;
un componente que renderiza + orquesta lógica de negocio; un service que valida +
transforma + persiste + notifica.

### Nomenclatura de tipos — prefijos obligatorios (MUST)

Todo tipo nuevo (frontend y backend) se prefija según su naturaleza, para
identificar de un vistazo si algo es contrato de forma, alias/unión o conjunto
de valores fijos, sin tener que ir a su declaración:

| Prefijo | Construcción TS | Ejemplo                                            |
| ------- | ---------------- | --------------------------------------------------- |
| `I`     | `interface`       | `IStageChipProps`, `IAuthState`, `ICandidatePort`   |
| `T`     | `type`            | `TUserRole`, `TProcessStage`, `TCreateInterviewDto` |
| `E`     | `enum`            | `EProcessStatus`, `EInterviewOutcome`               |

```typescript
// ✅
interface ICandidatePort {
  findByEmail(email: string): Promise<Candidate | null>;
}

type TUserRole = 'recruiter' | 'technical' | 'pm';

enum EInterviewOutcome {
  Advance = 'advance',
  Reject = 'reject',
  Hold = 'hold',
}

// ❌ — sin prefijo, ya no cumple la convención
interface CandidatePort { ... }
type UserRole = 'recruiter' | 'technical' | 'pm';
enum InterviewOutcome { ... }
```

**Aplica de aquí en adelante a todo código nuevo** (frontend y backend, incluida
`packages/shared-types`). No es retroactivo: el código existente (`UserRole`,
`ProcessStage`, `AuthState`, etc.) se renombra de forma incidental **solo** al
tocar ese archivo por otra razón (ej. durante el refactor de la Etapa 1/2 del
plan de remediación) — no se abre un PR exclusivamente para renombrar.

---

## 3. Backend — NestJS 10 + TypeScript 5

### 3.1 Arquitectura Hexagonal — estructura de carpetas

```
src/
├── capabilities/           # Un directorio por bounded context
│   └── <capability>/
│       ├── application/
│       │   ├── ports/      # Interfaces abstractas (contratos)
│       │   └── services/   # Casos de uso, orquestación — sin deps de infra
│       ├── domain/
│       │   ├── dto/        # Validación con class-validator — cero NestJS en domain
│       │   └── interfaces/ # Entidades, value objects — cero deps externas
│       └── infrastructure/
│           ├── adapters/   # Implementa ports (MongoDB, Redis, HTTP externo)
│           └── controllers/# Entry point HTTP — solo mapea request → service → response
├── shared/                 # Guards, interceptors, pipes, filtros cross-cutting
├── monitoring/             # Health checks
└── main.ts
```

#### Reglas de dependencia — inviolables

```
Controller → Service → Port (abstracto)
                           ↑
                        Adapter (implementa Port, conoce MongoDB/Redis/HTTP)

Domain → CERO dependencias externas (ni NestJS, ni Mongoose)
```

### 3.2 Límites de líneas por tipo de archivo

| Tipo                     | Límite         |
| ------------------------ | -------------- |
| Controller               | **55 líneas**  |
| Service (application)    | **80 líneas**  |
| Port (abstracto)         | **50 líneas**  |
| Adapter (infrastructure) | **100 líneas** |
| DTO                      | **45 líneas**  |
| Module                   | **60 líneas**  |
| Worker / Processor       | **100 líneas** |

### 3.3 Principios SOLID

#### S — Single Responsibility

```typescript
// ✅ CandidateAdapter → "persiste y recupera candidatos de MongoDB"
// ✅ InterviewService → "orquesta el agendamiento de una entrevista"
// ❌ ProcessService (200+ líneas) → "crea + asigna referentes + valida + notifica"
```

#### D — Dependency Inversion

```typescript
// ✅ Depende del port abstracto
constructor(private readonly candidatePort: CandidatePort) {}

// ❌ Depende del adaptador concreto
constructor(private readonly candidateAdapter: CandidateAdapter) {}
```

### 3.4 Convenciones de Código Backend

#### Nombres de archivo (kebab-case siempre)

| Tipo             | Sufijo           | Ejemplo                              |
| ---------------- | ---------------- | ------------------------------------ |
| Controller       | `.controller.ts` | `interview.controller.ts`            |
| Service          | `.service.ts`    | `interview-schedule.service.ts`      |
| Port (abstracto) | `.port.ts`       | `interview.port.ts`                  |
| Adapter          | `.adapter.ts`    | `interview-mongo.adapter.ts`         |
| DTO              | `.dto.ts`        | `create-interview.dto.ts`            |
| Module           | `.module.ts`     | `interviews.module.ts`               |

#### TypeScript

- `interface` → prefijo `I` (`ICandidatePort`, `ICreateInterviewDto`)
- `type` → prefijo `T` (`TUserRole`, `TProcessStage`)
- `enum` → prefijo `E` (`EInterviewOutcome`)
- Ver §2.7 "Nomenclatura de tipos" para el detalle y ejemplos — la regla es la misma en frontend y backend.

#### Error handling

```typescript
// ✅ Excepción de dominio con contexto
throw new NotFoundException(`Candidate ${id} not found`);

// ✅ Try/catch con log + re-throw transformado
try {
  // ...
} catch (error) {
  this.logger.error('Failed to schedule interview', error);
  throw new InternalServerErrorException('Failed to schedule interview');
}

// ❌ Catch silencioso — NUNCA
try { ... } catch {}
```

#### Logging

```typescript
private readonly logger = new Logger(InterviewService.name);

// ✅ Niveles correctos
this.logger.log(`Interview scheduled: id=${id} candidate="${email}"`);
this.logger.warn(`Referent unavailable: userId=${userId}`);
this.logger.error('Failed to send .ics', error);

// ❌ Nunca loguear datos sensibles (passwords, tokens, datos personales completos)
this.logger.log(JSON.stringify(fullRequestBody)); // FORBIDDEN
```

### 3.5 Controllers — composición, no lógica

Un controller **solo** debe: recibir la request, llamar un método de un service,
retornar la response. Auth, logging, validación y rate limiting se resuelven
por composición con Guards, Interceptors, Filters o Pipes.

```typescript
// ✅ Controller thin — solo delega
@Controller('interviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Post()
  @Roles('recruiter')
  create(@Body() dto: CreateInterviewDto): Promise<InterviewResponse> {
    return this.interviewService.schedule(dto);
  }
}
```

### 3.6 Convenciones REST

- **Recursos en plural**: `/candidates`, `/processes`, `/interviews` — nunca verbos en URL
- **Verbos HTTP**: `GET` (sin side-effects), `POST` (crear), `PATCH` (actualización parcial), `DELETE`
- **Códigos**: `200` ok, `201` creado, `204` sin contenido, `400` input inválido,
  `401` sin auth, `403` sin permisos, `404` no encontrado, `409` conflicto de negocio
- **Filtrado via query params**: `GET /candidates?processId=xyz` ✅
- **Anidación máx. 1 nivel**: `/interviews/:id/confirm` ✅ — no `/processes/:id/candidates/:cid/interviews`

---

## 4. Contratos Compartidos — `packages/shared-types`

- Solo tipos e interfaces TypeScript — **cero lógica de runtime**
- `packages/shared-utils` para funciones puras (formatters, validators, mapas de colores)
- Frontend y Backend importan del mismo paquete: `@ibm-talent-bridge/shared-types`
- Cambiar una interfaz = actualizar shared-types + rebuild + actualizar adapter + actualizar DTO

---

## 4.bis Mockups de Stitch (`DESIGN/`) — guía visual, no código fuente

`DESIGN/stitch_ibm_talent_bridge_portal/**/code.html` y sus `screen.png` son
generados por una herramienta externa (Stitch) para comunicar layout e
intención visual. **No son código a copiar ni a transcribir.** Un ejemplo real
de por qué esto es una regla no negociable: la versión original de
`LoginPage.tsx` (422 líneas) fue construida pegando casi literal el
`code.html` de `iniciar_sesi_n_ibm_talent_bridge/` — de ahí decenas de
`style={{ backgroundColor: '#0043ce', ... }}` con hex literales, cero
componentización, y lógica de negocio mezclada con el markup.

**Proceso correcto para traducir un mockup de Stitch a código:**

1. Usar el `code.html`/`screen.png` solo para identificar layout, jerarquía
   visual, textos y qué bloques se repiten (esos bloques repetidos son
   candidatos directos a molecule/organism).
2. Todo color, tipografía o espaciado del mockup se resuelve con clases
   Tailwind (`tailwind.config.ts`) o `config/design-tokens.ts` — nunca con
   `style={{ ... }}` de valores hardcodeados, salvo que el valor sea
   verdaderamente dinámico en runtime (ej. `StageChip` eligiendo color según
   `stage`).
3. Cualquier dato que el mockup muestre "ya cargado" (listas, KPIs, nombres)
   se modela vía el patrón mock-first de `infrastructure/` (sección 2.4) —
   nunca como constante `MOCK_*` dentro de la page.
4. El resultado se descompone en atoms/molecules/organisms/page siguiendo los
   límites de línea de la sección 2.5, no como un único archivo monolítico.

Ver ejemplos ejecutables en `good-practices/examples/frontend/` — en
particular `organism.example.tsx` y `page.example.tsx` documentan este
proceso paso a paso sobre un caso concreto.

---

## 5. Checklist antes de entregar cualquier tarea

```
ARQUITECTURA
[ ] Ningún archivo excede su límite de líneas
[ ] Domain no importa NestJS ni Mongoose
[ ] Controllers solo llaman Services, nunca Adapters directamente
[ ] Services solo llaman Ports, nunca Adapters directamente
[ ] Componentes React respetan su nivel Atomic Design y límite de líneas

TYPESCRIPT
[ ] Cero uses de `any`
[ ] Todas las props con `readonly` en interfaces
[ ] tsc --noEmit sin errores en backend y frontend

FRONTEND
[ ] Estado de servidor gestionado por React Query
[ ] Estado de cliente puro (auth, wizard) en Zustand
[ ] Sin `useEffect` para fetching de datos
[ ] Funciones HTTP solo en `infrastructure/` — nunca en hooks ni componentes
[ ] Componente nuevo en la carpeta Atomic correcta (atom/molecule/organism/page)
[ ] Si el componente aparece en 2+ features → movido a `shared/`
[ ] Si el origen es un mockup de `DESIGN/` (Stitch): componentizado y con tokens Tailwind, nunca HTML/estilos inline copiados literal (ver sección 4.bis)
[ ] Dato "que vendrá de un GET" modelado en `infrastructure/` (mock-first), nunca como `MOCK_*` en una page/componente

BACKEND
[ ] DTO con class-validator decorators
[ ] Port abstracto definido antes del adapter
[ ] Error handling con logger + excepción tipada de NestJS
[ ] Nuevo endpoint registrado en el module correspondiente
```

---

_Ver también: [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md) · `.clinerules`_

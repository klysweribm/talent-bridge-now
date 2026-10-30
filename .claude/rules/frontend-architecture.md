---
paths:
  - "apps/frontend/src/**/*.{ts,tsx}"
---

# Frontend architecture — Feature Slices + Atomic Design

Detail and examples: `good-practices/BEST-PRACTICES.md` §2 (read only the section you need). Golden-path reference files: `good-practices/examples/frontend/` and the already-refactored `features/auth/`.

## Layout

`src/features/<feature>/{components/{atoms,molecules,organisms,pages},hooks,infrastructure,store,types}` and `src/shared/{components/{atoms,molecules,organisms},hooks,layouts,store,utils}`, plus `router/` (role guards) and `config/` (env + `design-tokens.ts`). Aliases: `@/*`, `@shared/*`, `@features/*`.

Used in exactly one feature → stays in that feature. Used in 2+ features → moves to `shared/`.

## Data-flow boundary

```
Page (routing, composition) → Organism (ONLY layer that calls useQuery/useMutation/useStore)
  → Molecule (props only) → Atom (props only, purely presentational)
```

No upward imports (an atom never imports a molecule/organism). Molecules and atoms never import a data hook or a store.

## State — two non-overlapping owners

- **React Query** owns everything that comes from the server (GET) and every mutation (POST/PATCH/DELETE). One hook per domain operation (`useProcessesQuery`, `useCreateProcessMutation`).
- **Zustand** owns only client-generated state that never comes from a GET: auth session (JWT/role/profile), wizard step before final submit, UI prefs. Many small per-feature stores (`features/<f>/store/<name>.store.ts`), never one global store.
- Never copy React Query data into Zustand or `useState`; never fetch in `useEffect`; derive with `useMemo` if expensive.
- **One `QueryClient`**, the singleton in `shared/infrastructure/queryClient.ts` (never `new QueryClient` in app code). Its cache is emptied by `installSessionCacheGuard` (`shared/infrastructure/sessionCacheGuard.ts`) whenever the auth store's session ends or the user changes — that responsibility belongs to the guard, not to each logout/401 caller. `client.clear()` does not re-fetch a component that stays mounted, so **every `useQuery` must live under the protected route tree** (which unmounts on logout), never above it.
- The session is also time-bound: `ProtectedRoute` treats `!token || isTokenExpired(token)` (`features/auth/utils/tokenExpiry.ts`, fails closed) as unauthenticated during render, and `useSessionExpiry` ends the session at the JWT's `exp`. The backend 401 stays the authority; this only avoids painting protected UI with a dead token.

## Infrastructure

- HTTP only in `features/<f>/infrastructure/*.infra.ts` — pure async functions, no hooks, no JSX, no cache logic. Hooks call infrastructure, never `fetch` directly.
- **Mock-first** while the feature's backend doesn't exist: the infra function returns typed mock data with the same signature the real call will have, so swapping to HTTP later touches only that file. Mocks never live inside components/pages.

## Design

- Carbon Design System + Tailwind utilities mapped from tokens in `tailwind.config.ts` / `config/design-tokens.ts`. Never a raw hex/px value in a component when a token exists.
- IBM Plex Sans; icons only through the shared `Icon` atom, never inline SVG in a component.
- `DESIGN/` holds local mockups that are **not a design source** — never paste their HTML. Decompose into atoms/molecules/organisms + tokens first (`BEST-PRACTICES.md` §4.bis).
- Table and list rows: 48px compact / 56px standard.
- Forms: `react-hook-form` + `zod` (`zodResolver`), schema next to the form hook (see `features/auth/hooks/useLoginForm.ts`).

## Naming

`PascalCase.tsx` components (one folder per component when it has a test), `useCamelCase.ts` hooks, `camelCase.infra.ts`, `camelCase.store.ts`.

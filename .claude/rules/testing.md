---
paths:
  - "apps/**/*.test.{ts,tsx}"
  - "apps/**/*.spec.ts"
---

# Testing

## Frontend — Vitest + Testing Library (`apps/frontend`)

- Co-located `*.test.ts(x)` next to the source file. Global setup: `src/test/setup.ts` (jest-dom matchers).
- Single file: `npx vitest run path/to/file.test.tsx`; all: `npm test -- --run`.
- Query by role/label (`getByRole`, `getByLabelText`), interact with `userEvent`, not `fireEvent`. Assert on what the user sees, not on internal state.
- Components using React Query/Router need a wrapper: fresh `QueryClient` with `retry: false` + `MemoryRouter` — see `features/auth/components/pages/LoginPage.test.tsx`.
- Reset Zustand stores in `beforeEach` (e.g. `useAuthStore.getState().clearAuth()`).
- Mock at the `infrastructure/` boundary (`vi.mock('../infrastructure/x.infra')`), never mock React Query itself.
- Every new atom/molecule/organism/page gets a test (Etapa 1 standard).

## Backend — Jest (`apps/backend`)

- `*.spec.ts`, jest `rootDir` is `src`. Single file: `npx jest path/to/file.spec.ts`.
- Unit-test services by injecting **fake ports** (plain objects implementing the port interface with `jest.fn()`), never by mocking Mongoose or an adapter module.
- Adapters are covered by e2e/integration tests (`npm run test:e2e`, `docker-compose.test.yml`), not unit tests with a mocked Mongoose.
- Controllers: thin, so one test per route checking the service call + status code is enough.

## Both

- Test name: `"should <do X> when <condition>"`, matching existing specs.
- **Gherkin → TDD:** a task specified as Gherkin (`Feature`/`Scenario`/`Given`/`When`/`Then`) requires plan mode first, then strict TDD — each Scenario becomes a `describe`/`it` block written and seen failing *before* implementation code. No Cucumber runner; map Scenarios 1:1 to plain Vitest/Jest blocks.

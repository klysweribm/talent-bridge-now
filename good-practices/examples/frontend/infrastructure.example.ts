// Infrastructure — máx 50 líneas. Funciones HTTP puras: sin hooks, sin JSX,
// sin importar React. Hoy resuelven con mock/fixture; el día que el backend
// exista, solo cambia el CUERPO de la función — el hook y el componente que
// la consumen no se tocan.
//
// ❌ NO hacer: dejar `const MOCK_USERS = [...]` dentro de una page.tsx.
//    Ese dato "vendrá de un GET" en el futuro → pertenece aquí.

import type { AuthUser } from '@features/auth/store/auth.store';

interface UserListItem {
  readonly id:   string;
  readonly user: AuthUser;
}

const MOCK_USERS: readonly UserListItem[] = [
  { id: '1', user: { id: '1', name: 'Carlos López', email: 'carlos.lopez@ibm.com', role: 'technical_ref' } },
  { id: '2', user: { id: '2', name: 'Ana García',   email: 'ana.garcia@ibm.com',   role: 'recruiter' } },
];

const SIMULATED_LATENCY_MS = 400;

export function fetchUsers(): Promise<readonly UserListItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_USERS), SIMULATED_LATENCY_MS);
  });
}

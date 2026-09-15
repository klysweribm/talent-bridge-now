// Hook — máx 60 líneas. Un hook por operación de dominio. Es el ÚNICO punto
// de contacto entre un organism y los datos (React Query) o el estado de
// cliente (Zustand). Molecules y atoms nunca importan hooks de datos.
//
// ❌ NO hacer: llamar fetchUsers() dentro de un useEffect + useState.
//    Eso duplica lo que React Query ya resuelve (cache, dedup, refetch).

import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from './infrastructure.example';

const USERS_QUERY_KEY = ['users'] as const;

export function useUsersQuery() {
  return useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: fetchUsers,
  });
}

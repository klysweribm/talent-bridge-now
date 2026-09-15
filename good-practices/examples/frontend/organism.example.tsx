// Organism — máx 100 líneas. Es el LÍMITE de la capa de datos: aquí sí se
// llama useQuery/useStore. Compone molecules/atoms, les pasa props — nunca
// al revés. Referencia real: apps/frontend/src/shared/components/molecules/
// InterviewCard ya compone Avatar+StageChip; un organism hace lo mismo un
// nivel más arriba, con datos reales del hook.
//
// Traducción de un mockup de Stitch (DESIGN/**/code.html) a este organism:
//   1. El code.html mostraba una lista de usuarios "ya cargada" con nombres,
//      email y un punto de color por estado → eso NO es HTML fijo, es la
//      salida de fetchUsers(). Se modela con useUsersQuery(), no con un
//      array pegado en el JSX.
//   2. Cada fila repetida del mockup → UserRow (molecule), no un <li> inline
//      con estilos propios copiados del HTML.
//   3. Los colores hex del code.html (ej. verde para "online") → se
//      resuelven en el atom (StatusDot) vía clases Tailwind, nunca aquí.

import { UserRow } from './molecule.example';
import { useUsersQuery } from './hook.example';

export interface UserListProps {
  readonly onSelectUser?: (userId: string) => void;
  readonly className?:    string;
}

export function UserList({ onSelectUser, className = '' }: UserListProps) {
  const { data: users, isLoading, isError } = useUsersQuery();

  if (isLoading) {
    return <p className="text-body-md text-text-secondary">Cargando usuarios…</p>;
  }

  if (isError || !users) {
    return <p role="alert" className="text-body-md text-status-danger">No se pudo cargar la lista.</p>;
  }

  return (
    <div className={['flex flex-col gap-2xs', className].join(' ')}>
      {users.map(({ id, user }) => (
        <UserRow
          key={id}
          name={user.name}
          email={user.email}
          status="online"
          onSelect={onSelectUser ? () => onSelectUser(id) : undefined}
        />
      ))}
    </div>
  );
}

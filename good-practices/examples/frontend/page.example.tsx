// Page — máx 90 líneas. Composición pura + orquestación (routing, params de
// URL). NUNCA lógica de negocio ni estilos inline masivos aquí.
//
// ❌ Antipatrón real que existió en este proyecto — LoginPage.tsx (422 líneas)
//    antes de su refactor: todo el markup del code.html de Stitch pegado
//    literal en la page, con decenas de `style={{ backgroundColor: '#0043ce', ... }}`
//    en vez de Tailwind, sin descomponer en atoms/molecules, con la
//    simulación de login inline en vez de infrastructure/. Ese archivo es el
//    ejemplo de qué NO hacer al traducir un mockup — ver refactor real en
//    features/auth/components/ tras Etapa 1 del plan de remediación.
//
// ✅ Una page correcta que traduce un mockup se ve así: solo importa
//    organisms ya resueltos, sin JSX de detalle.

import { useNavigate } from 'react-router-dom';
import { UserList } from './organism.example';

export function UsersPage() {
  const navigate = useNavigate();

  return (
    <div className="px-xl py-lg flex flex-col gap-lg w-full max-w-[1200px] mx-auto">
      <header className="flex items-center justify-between">
        <h1 className="text-headline-lg text-text-primary">Usuarios</h1>
      </header>

      <UserList onSelectUser={(id) => navigate(`/users/${id}`)} />
    </div>
  );
}

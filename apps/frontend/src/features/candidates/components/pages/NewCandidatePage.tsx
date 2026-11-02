import { NewCandidateFlow } from '../organisms/NewCandidateFlow';

export function NewCandidatePage(): JSX.Element {
  return (
    <div className="px-xl py-lg flex flex-col gap-lg w-full max-w-4xl mx-auto">
      <header className="flex flex-col gap-xs">
        <h1 className="text-headline-md text-text-primary">Agregar candidato</h1>
        <p className="text-body-md text-text-secondary">
          Sube un CV para extraer el perfil, revísalo y confirma. Nada se guarda hasta que lo confirmes.
        </p>
      </header>
      <NewCandidateFlow />
    </div>
  );
}

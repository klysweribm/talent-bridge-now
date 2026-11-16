import { NewCandidateFlow } from '../organisms/NewCandidateFlow';

export function NewCandidatePage(): JSX.Element {
  return (
    <div className="flex flex-col gap-lg w-full max-w-content-narrow mx-auto px-xl pt-lg pb-[96px]">
      <header className="flex flex-col gap-xs">
        <h1 className="text-h1 text-carbon-gray-100">Agregar candidato</h1>
        <p className="text-body text-carbon-gray-70">
          Sube un CV para extraer el perfil, revísalo y confirma. Nada se guarda hasta que lo confirmes.
        </p>
      </header>
      <NewCandidateFlow />
    </div>
  );
}

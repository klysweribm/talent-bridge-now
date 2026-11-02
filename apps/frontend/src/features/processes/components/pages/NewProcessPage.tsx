import { RequirementBox } from '../molecules/RequirementBox';

const CANDIDATES_NEW_PATH = '/candidates/new';

export function NewProcessPage(): JSX.Element {
  return (
    <div className="px-xl py-lg flex flex-col gap-lg w-full max-w-7xl mx-auto">
      <header className="flex flex-col gap-xs">
        <h1 className="text-headline-md text-text-primary">Nuevo proceso</h1>
        <p className="text-body-md text-text-secondary">Completa los requisitos del proceso.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        <RequirementBox
          title="Agregar candidato"
          description="Sube un CV, revisa el perfil extraído y crea el candidato."
          to={CANDIDATES_NEW_PATH}
        />
        <RequirementBox title="Seleccionar referente técnico" description="Elige quién evaluará a los candidatos." />
        <RequirementBox title="Requisitos de la posición" description="Define el rol, el seniority y las skills." />
      </div>
    </div>
  );
}
